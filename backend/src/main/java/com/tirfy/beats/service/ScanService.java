package com.tirfy.beats.service;

import com.tirfy.beats.dto.ScanRequest;
import com.tirfy.beats.dto.ScanResponse;
import com.tirfy.beats.entity.Checkpoint;
import com.tirfy.beats.entity.CheckpointScan;
import com.tirfy.beats.entity.Participant;
import com.tirfy.beats.entity.ParticipantStatus;
import com.tirfy.beats.entity.User;
import com.tirfy.beats.repository.CheckpointRepository;
import com.tirfy.beats.repository.CheckpointScanRepository;
import com.tirfy.beats.repository.ParticipantRepository;
import com.tirfy.beats.repository.UserRepository;
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

    public ScanService(
            ParticipantRepository participantRepository,
            CheckpointRepository checkpointRepository,
            CheckpointScanRepository checkpointScanRepository,
            UserRepository userRepository) {

        this.participantRepository = participantRepository;
        this.checkpointRepository = checkpointRepository;
        this.checkpointScanRepository = checkpointScanRepository;
        this.userRepository = userRepository;
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

        // 2. Find volunteer in database
        User volunteer = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"));

        // 3. Verify volunteer is active
        if (!Boolean.TRUE.equals(volunteer.getIsActive())) {
            throw new RuntimeException(
                    "Volunteer account is inactive");
        }

        // 4. Verify volunteer has a checkpoint
        if (volunteer.getAssignedCheckpoint() == null) {
            throw new RuntimeException(
                    "No checkpoint assigned to volunteer");
        }

        // 5. Find participant using QR token
        Participant participant = participantRepository
                .findByQrToken(request.getQrToken())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid QR code"));

        // 6. Reject dropped-out participant
        if (participant.getStatus() ==
                ParticipantStatus.DROPPED_OUT) {

            throw new RuntimeException(
                    "Participant has dropped out");
        }

        // 7. Use the volunteer's assigned checkpoint
        // instead of trusting the request
        Checkpoint checkpoint =
                volunteer.getAssignedCheckpoint();

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