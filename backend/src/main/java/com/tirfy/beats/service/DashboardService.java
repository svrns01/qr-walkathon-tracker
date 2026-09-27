package com.tirfy.beats.service;

import com.tirfy.beats.dto.CheckpointDashboardResponse;
import com.tirfy.beats.dto.FastestLapResponse;
import com.tirfy.beats.dto.ParticipantStatusResponse;
import com.tirfy.beats.entity.Checkpoint;
import com.tirfy.beats.entity.CheckpointScan;
import com.tirfy.beats.entity.Participant;
import com.tirfy.beats.entity.ParticipantStatus;
import com.tirfy.beats.repository.CheckpointRepository;
import com.tirfy.beats.repository.CheckpointScanRepository;
import com.tirfy.beats.repository.ParticipantRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final ParticipantRepository participantRepository;
    private final CheckpointRepository checkpointRepository;
    private final CheckpointScanRepository checkpointScanRepository;

    public DashboardService(
            ParticipantRepository participantRepository,
            CheckpointRepository checkpointRepository,
            CheckpointScanRepository checkpointScanRepository) {

        this.participantRepository = participantRepository;
        this.checkpointRepository = checkpointRepository;
        this.checkpointScanRepository = checkpointScanRepository;
    }

    public CheckpointDashboardResponse getCheckpointDashboard(
            Long checkpointId) {

        // ==========================================
        // SELECTED CHECKPOINT
        // ==========================================

        Checkpoint checkpoint =
                checkpointRepository.findById(checkpointId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Checkpoint not found"));


        // ==========================================
        // ACTIVE PARTICIPANTS
        // ==========================================

        List<Participant> activeParticipants =
                participantRepository.findAll()
                        .stream()
                        .filter(participant ->
                                participant.getStatus()
                                        == ParticipantStatus.ACTIVE)
                        .toList();


        // ==========================================
        // REACHED PARTICIPANTS
        // ==========================================

        List<CheckpointScan> checkpointScans =
                checkpointScanRepository
                        .findByCheckpointId(checkpointId);

        Map<Long, CheckpointScan> reachedMap =
                new HashMap<>();

        for (CheckpointScan scan : checkpointScans) {

            Long participantId =
                    scan.getParticipant().getId();

            CheckpointScan existing =
                    reachedMap.get(participantId);

            /*
             * If a participant has been scanned more than once
             * at this checkpoint, use the latest scan.
             */

            if (existing == null ||
                    scan.getScannedAt()
                            .isAfter(existing.getScannedAt())) {

                reachedMap.put(
                        participantId,
                        scan);
            }
        }


        // ==========================================
        // REACHED / YET TO REACH LISTS
        // ==========================================

        List<ParticipantStatusResponse> reached =
                new ArrayList<>();

        List<ParticipantStatusResponse> yetToReach =
                new ArrayList<>();

        for (Participant participant :
                activeParticipants) {

            CheckpointScan scan =
                    reachedMap.get(participant.getId());

            if (scan != null) {

                reached.add(
                        new ParticipantStatusResponse(
                                participant.getId(),
                                participant.getParticipantCode(),
                                participant.getName(),
                                participant.getStatus().name(),
                                scan.getScannedAt()
                        )
                );

            } else {

                yetToReach.add(
                        new ParticipantStatusResponse(
                                participant.getId(),
                                participant.getParticipantCode(),
                                participant.getName(),
                                participant.getStatus().name(),
                                null
                        )
                );
            }
        }


        // Earliest arrival first

        reached.sort(
                Comparator.comparing(
                        ParticipantStatusResponse::getScannedAt)
        );


        // ==========================================
        // FASTEST LAP
        // ==========================================

        List<FastestLapResponse> fastestLaps =
                calculateFastestLaps(
                        checkpoint,
                        activeParticipants
                );


        // ==========================================
        // COUNTS
        // ==========================================

        int totalActive =
                activeParticipants.size();

        int reachedCount =
                reached.size();

        int yetToReachCount =
                yetToReach.size();


        // ==========================================
        // RESPONSE
        // ==========================================

        return new CheckpointDashboardResponse(
                checkpoint.getId(),
                checkpoint.getName(),
                totalActive,
                reachedCount,
                yetToReachCount,
                reached,
                yetToReach,
                fastestLaps
        );
    }


    // ==========================================================
    // FASTEST LAP CALCULATION
    // ==========================================================

    private List<FastestLapResponse> calculateFastestLaps(
            Checkpoint currentCheckpoint,
            List<Participant> activeParticipants) {

        List<FastestLapResponse> fastestLaps =
                new ArrayList<>();


        // ------------------------------------------------------
        // Find the immediately previous checkpoint
        // ------------------------------------------------------

        Checkpoint previousCheckpoint =
                checkpointRepository
                        .findAll()
                        .stream()
                        .filter(checkpoint ->
                                checkpoint.getDayNumber()
                                        .equals(
                                                currentCheckpoint
                                                        .getDayNumber()
                                        )
                                        &&
                                        checkpoint.getSequenceNumber()
                                                ==
                                                currentCheckpoint
                                                        .getSequenceNumber()
                                                        - 1
                        )
                        .findFirst()
                        .orElse(null);


        /*
         * If there is no previous checkpoint,
         * there cannot be a lap.
         *
         * Example:
         *
         * START checkpoint
         *      ↓
         * No previous checkpoint
         *      ↓
         * No lap
         */

        if (previousCheckpoint == null) {
            return fastestLaps;
        }


        // ------------------------------------------------------
        // Get scans at the previous checkpoint
        // ------------------------------------------------------

        List<CheckpointScan> previousScans =
                checkpointScanRepository
                        .findByCheckpointId(
                                previousCheckpoint.getId()
                        );


        // ------------------------------------------------------
        // Get scans at the current checkpoint
        // ------------------------------------------------------

        List<CheckpointScan> currentScans =
                checkpointScanRepository
                        .findByCheckpointId(
                                currentCheckpoint.getId()
                        );


        // ------------------------------------------------------
        // Map participant → latest previous scan
        // ------------------------------------------------------

        Map<Long, CheckpointScan> previousScanMap =
                new HashMap<>();

        for (CheckpointScan scan : previousScans) {

            Long participantId =
                    scan.getParticipant().getId();

            CheckpointScan existing =
                    previousScanMap.get(participantId);

            if (existing == null ||
                    scan.getScannedAt()
                            .isAfter(existing.getScannedAt())) {

                previousScanMap.put(
                        participantId,
                        scan
                );
            }
        }


        // ------------------------------------------------------
        // Map participant → latest current scan
        // ------------------------------------------------------

        Map<Long, CheckpointScan> currentScanMap =
                new HashMap<>();

        for (CheckpointScan scan : currentScans) {

            Long participantId =
                    scan.getParticipant().getId();

            CheckpointScan existing =
                    currentScanMap.get(participantId);

            if (existing == null ||
                    scan.getScannedAt()
                            .isAfter(existing.getScannedAt())) {

                currentScanMap.put(
                        participantId,
                        scan
                );
            }
        }


        // ------------------------------------------------------
        // Calculate laps for ACTIVE participants
        // ------------------------------------------------------

        for (Participant participant :
                activeParticipants) {

            CheckpointScan previousScan =
                    previousScanMap.get(
                            participant.getId()
                    );

            CheckpointScan currentScan =
                    currentScanMap.get(
                            participant.getId()
                    );


            /*
             * Both scans are mandatory.
             *
             * If a participant joined mid-route and
             * doesn't have the previous checkpoint scan,
             * no lap is calculated.
             */

            if (previousScan == null ||
                    currentScan == null) {

                continue;
            }


            long lapSeconds =
                    Duration.between(
                            previousScan.getScannedAt(),
                            currentScan.getScannedAt()
                    ).getSeconds();


            /*
             * Ignore impossible negative durations.
             */

            if (lapSeconds < 0) {
                continue;
            }


            fastestLaps.add(
                    new FastestLapResponse(
                            participant.getId(),
                            participant.getParticipantCode(),
                            participant.getName(),
                            previousCheckpoint.getId(),
                            currentCheckpoint.getId(),
                            lapSeconds
                    )
            );
        }


        // ------------------------------------------------------
        // Fastest first
        // ------------------------------------------------------

        fastestLaps.sort(
                Comparator.comparingLong(
                        FastestLapResponse::getLapSeconds
                )
        );


        // ------------------------------------------------------
        // Top 10 only
        // ------------------------------------------------------

        if (fastestLaps.size() > 10) {

            return new ArrayList<>(
                    fastestLaps.subList(0, 10)
            );
        }

        return fastestLaps;
    }
}