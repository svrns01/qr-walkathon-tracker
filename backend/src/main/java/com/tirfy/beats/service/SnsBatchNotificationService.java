package com.tirfy.beats.service;

import com.tirfy.beats.entity.CheckpointScan;
import com.tirfy.beats.repository.CheckpointScanRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SnsBatchNotificationService {

    private final CheckpointScanRepository checkpointScanRepository;
    private final SnsNotificationService snsNotificationService;

    public SnsBatchNotificationService(
            CheckpointScanRepository checkpointScanRepository,
            SnsNotificationService snsNotificationService) {

        this.checkpointScanRepository = checkpointScanRepository;
        this.snsNotificationService = snsNotificationService;
    }

    @Scheduled(cron = "0 */10 * * * *", zone = "Asia/Kolkata")
    public void publishScanSummary() {

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));

        LocalDateTime windowEnd =
                now.withSecond(0).withNano(0);

        LocalDateTime windowStart =
                windowEnd.minusMinutes(10);

        List<CheckpointScan> scans =
                checkpointScanRepository.findByScannedAtBetween(
                        windowStart,
                        windowEnd
                );

        if (scans.isEmpty()) {
            return;
        }

        // Latest scan for each participant + checkpoint.
        Map<String, CheckpointScan> latestScans =
                scans.stream()
                        .collect(Collectors.toMap(
                                scan -> scan.getParticipant().getId()
                                        + "-"
                                        + scan.getCheckpoint().getId(),
                                Function.identity(),
                                (first, second) ->
                                        second.getScannedAt()
                                                .isAfter(first.getScannedAt())
                                                ? second
                                                : first
                        ));

        List<String> summaryLines =
                latestScans.values()
                        .stream()
                        .sorted((a, b) ->
                                a.getScannedAt()
                                        .compareTo(b.getScannedAt()))
                        .map(scan -> {

                            String volunteerName =
                                    scan.getVolunteer().getName();

                            if (volunteerName == null ||
                                    volunteerName.isBlank()) {

                                volunteerName =
                                        scan.getVolunteer().getEmail();
                            }

                            return
                                    "Participant ID: "
                                            + scan.getParticipant()
                                            .getParticipantCode()
                                            + " | Name: "
                                            + scan.getParticipant()
                                            .getName()
                                            + " | Checkpoint: "
                                            + scan.getCheckpoint()
                                            .getName()
                                            + " | Volunteer: "
                                            + volunteerName
                                            + " | Time: "
                                            + scan.getScannedAt();
                        })
                        .toList();

        try {

            snsNotificationService.publishCheckpointScanSummary(
                    summaryLines,
                    windowStart.toString(),
                    windowEnd.toString()
            );

        } catch (Exception e) {

            System.err.println(
                    "SNS batch notification failed: "
                            + e.getMessage());

            e.printStackTrace();
        }
    }
}