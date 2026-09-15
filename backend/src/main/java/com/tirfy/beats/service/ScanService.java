package com.tirfy.beats.service;

import com.tirfy.beats.dto.ScanRequest;
import com.tirfy.beats.dto.ScanResponse;
import com.tirfy.beats.entity.Checkpoint;
import com.tirfy.beats.entity.CheckpointScan;
import com.tirfy.beats.entity.Participant;
import com.tirfy.beats.entity.ParticipantStatus;
import com.tirfy.beats.entity.User;
import com.tirfy.beats.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ScanService {

    private final ParticipantRepository participantRepository;
    private final CheckpointRepository checkpointRepository;
    private final CheckpointScanRepository checkpointScanRepository;
    private final UserRepository userRepository;
    private final UserCheckpointAccessRepository
            userCheckpointAccessRepository;

    public ScanService(
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

    public ScanResponse processScan(ScanRequest request) {

        // 1. Get authenticated user
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Authentication required");
        }

        String email = authentication.getName();

        // 2. Find authenticated user
        User volunteer = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"));

        // 3. Verify user is active
        if (!Boolean.TRUE.equals(volunteer.getIsActive())) {
            throw new RuntimeException(
                    "Volunteer account is inactive");
        }

        // 4. Find requested checkpoint
        Checkpoint checkpoint =
                checkpointRepository
                        .findById(request.getCheckpointId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Checkpoint not found"));

        // 5. Verify volunteer has access
        boolean hasAccess =
                userCheckpointAccessRepository
                        .existsByUserIdAndCheckpointId(
                                volunteer.getId(),
                                checkpoint.getId());

        if (!hasAccess) {
            throw new RuntimeException(
                    "Volunteer is not authorized for this checkpoint");
        }

        // 6. Find participant using QR token
        Participant participant =
                participantRepository
                        .findByQrToken(request.getQrToken())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid QR code"));

        // 7. Reject dropped-out participant
        if (participant.getStatus() ==
                ParticipantStatus.DROPPED_OUT) {

            throw new RuntimeException(
                    "Participant has dropped out");
        }

        // 8. Check existing scan
        CheckpointScan scan =
                checkpointScanRepository
                        .findByParticipantIdAndCheckpointId(
                                participant.getId(),
                                checkpoint.getId())
                        .orElse(null);

        // 9. Create scan if it doesn't exist
        if (scan == null) {

            scan = new CheckpointScan();

            scan.setParticipant(participant);
            scan.setCheckpoint(checkpoint);
            scan.setVolunteer(volunteer);
        }

        // 10. Update scan
        scan.setScanUuid(request.getScanUuid());
        scan.setScannedAt(LocalDateTime.now());
        scan.setDeviceId(request.getDeviceId());

        // 11. Save
        CheckpointScan savedScan =
                checkpointScanRepository.save(scan);

        // 12. Return response
        return new ScanResponse(
                savedScan.getId(),
                savedScan.getScanUuid(),
                participant.getId(),
                participant.getParticipantCode(),
                participant.getName(),
                checkpoint.getId(),
                checkpoint.getName(),
                savedScan.getScannedAt()
        );
    }
}