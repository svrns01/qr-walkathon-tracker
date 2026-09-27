package com.tirfy.beats.service;

import com.tirfy.beats.dto.ScanSyncItemResponse;
import com.tirfy.beats.dto.ScanSyncRequest;
import com.tirfy.beats.dto.ScanSyncResponse;
import com.tirfy.beats.entity.Checkpoint;
import com.tirfy.beats.entity.CheckpointScan;
import com.tirfy.beats.entity.Participant;
import com.tirfy.beats.entity.ParticipantStatus;
import com.tirfy.beats.entity.User;
import com.tirfy.beats.repository.CheckpointRepository;
import com.tirfy.beats.repository.CheckpointScanRepository;
import com.tirfy.beats.repository.ParticipantRepository;
import com.tirfy.beats.repository.UserCheckpointAccessRepository;
import com.tirfy.beats.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScanSyncService {

    private final ParticipantRepository participantRepository;
    private final CheckpointRepository checkpointRepository;
    private final CheckpointScanRepository checkpointScanRepository;
    private final UserRepository userRepository;
    private final UserCheckpointAccessRepository
            userCheckpointAccessRepository;

    public ScanSyncService(
            ParticipantRepository participantRepository,
            CheckpointRepository checkpointRepository,
            CheckpointScanRepository checkpointScanRepository,
            UserRepository userRepository,
            UserCheckpointAccessRepository
                    userCheckpointAccessRepository) {

        this.participantRepository = participantRepository;
        this.checkpointRepository = checkpointRepository;
        this.checkpointScanRepository = checkpointScanRepository;
        this.userRepository = userRepository;
        this.userCheckpointAccessRepository =
                userCheckpointAccessRepository;
    }

    public ScanSyncResponse syncScans(
            List<ScanSyncRequest> requests) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Authentication required");
        }

        User volunteer =
                userRepository.findByEmail(
                        authentication.getName()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"));

        if (!Boolean.TRUE.equals(volunteer.getIsActive())) {
            throw new RuntimeException(
                    "Volunteer account is inactive");
        }

        List<ScanSyncItemResponse> results =
                new ArrayList<>();

        int accepted = 0;
        int rejected = 0;

        for (ScanSyncRequest request : requests) {

            try {

                processOneScan(request, volunteer);

                results.add(
                        new ScanSyncItemResponse(
                                request.getScanUuid(),
                                true,
                                "Scan accepted"
                        )
                );

                accepted++;

            } catch (RuntimeException e) {

                results.add(
                        new ScanSyncItemResponse(
                                request.getScanUuid(),
                                false,
                                e.getMessage()
                        )
                );

                rejected++;
            }
        }

        return new ScanSyncResponse(
                requests.size(),
                accepted,
                rejected,
                results
        );
    }

    private void processOneScan(
            ScanSyncRequest request,
            User volunteer) {

        // 1. Validate required fields

        if (request.getScanUuid() == null) {
            throw new RuntimeException(
                    "Scan UUID is required");
        }

        if (request.getQrToken() == null ||
                request.getQrToken().isBlank()) {

            throw new RuntimeException(
                    "QR token is required");
        }

        if (request.getCheckpointId() == null) {
            throw new RuntimeException(
                    "Checkpoint ID is required");
        }

        if (request.getScannedAt() == null) {
            throw new RuntimeException(
                    "Scan time is required");
        }

        // 2. Idempotency check

        if (checkpointScanRepository
                .findByScanUuid(request.getScanUuid())
                .isPresent()) {

            throw new RuntimeException(
                    "Scan already processed");
        }

        // 3. Find checkpoint

        Checkpoint checkpoint =
                checkpointRepository
                        .findById(request.getCheckpointId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Checkpoint not found"));

        // 4. Verify volunteer checkpoint access

        boolean hasAccess =
                userCheckpointAccessRepository
                        .existsByUserIdAndCheckpointId(
                                volunteer.getId(),
                                checkpoint.getId());

        if (!hasAccess) {
            throw new RuntimeException(
                    "Volunteer is not authorized for this checkpoint");
        }

        // 5. Find participant using authoritative QR token

        Participant participant =
                participantRepository
                        .findByQrToken(request.getQrToken())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid QR code"));

        // 6. Optional consistency check

        if (request.getParticipantId() != null &&
                !participant.getId().equals(
                        request.getParticipantId())) {

            throw new RuntimeException(
                    "Participant information does not match QR code");
        }

        // 7. Validate current participant status

        if (participant.getStatus() ==
                ParticipantStatus.NOT_STARTED) {

            throw new RuntimeException(
                    "Participant has not started yet");
        }

        if (participant.getStatus() ==
                ParticipantStatus.DROPPED_OUT) {

            throw new RuntimeException(
                    "Participant has dropped out");
        }

        if (participant.getStatus() ==
                ParticipantStatus.COMPLETED) {

            throw new RuntimeException(
                    "Participant has already completed the walkathon");
        }

        if (participant.getStatus() !=
                ParticipantStatus.ACTIVE) {

            throw new RuntimeException(
                    "Participant is not active");
        }

        // 8. Check existing participant + checkpoint scan

        CheckpointScan scan =
                checkpointScanRepository
                        .findByParticipantIdAndCheckpointId(
                                participant.getId(),
                                checkpoint.getId())
                        .orElse(null);

        // 9. Existing scan → latest timestamp wins

        if (scan != null) {

            LocalDateTime existingTime =
                    scan.getScannedAt();

            if (existingTime != null &&
                    !request.getScannedAt()
                            .isAfter(existingTime)) {

                throw new RuntimeException(
                        "Older scan ignored; newer scan already exists");
            }
        }

        // 10. Create scan if necessary

        if (scan == null) {

            scan = new CheckpointScan();

            scan.setParticipant(participant);
            scan.setCheckpoint(checkpoint);
            scan.setVolunteer(volunteer);
        }

        // 11. Preserve the ORIGINAL offline scan time

        scan.setScanUuid(request.getScanUuid());
        scan.setScannedAt(request.getScannedAt());
        scan.setDeviceId(request.getDeviceId());

        // 12. Save

        checkpointScanRepository.save(scan);
    }
}