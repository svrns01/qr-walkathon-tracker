package com.tirfy.beats.service;

import com.tirfy.beats.dto.ScanRequest;
import com.tirfy.beats.dto.ScanResponse;
import com.tirfy.beats.dto.ScanRequest;
import com.tirfy.beats.entity.Checkpoint;
import com.tirfy.beats.entity.CheckpointScan;
import com.tirfy.beats.entity.Participant;
import com.tirfy.beats.entity.ParticipantStatus;
import com.tirfy.beats.entity.User;
import com.tirfy.beats.repository.CheckpointRepository;
import com.tirfy.beats.repository.CheckpointScanRepository;
import com.tirfy.beats.repository.ParticipantRepository;
import com.tirfy.beats.repository.UserRepository;
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

        // 1. Find participant using QR token
        Participant participant = participantRepository
                .findByQrToken(request.getQrToken())
                .orElseThrow(() ->
                        new RuntimeException("Invalid QR code"));

        // 2. Reject dropped-out participant
        if (participant.getStatus() == ParticipantStatus.DROPPED_OUT) {
            throw new RuntimeException(
                    "Participant has dropped out");
        }

        // 3. Find checkpoint
        Checkpoint checkpoint = checkpointRepository
                .findById(request.getCheckpointId())
                .orElseThrow(() ->
                        new RuntimeException("Checkpoint not found"));

        // 4. Temporary volunteer
        // Authentication will replace this on Day 8.
        User volunteer = userRepository.findById(1L)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Volunteer test user not found"));

        // 5. Check if this participant already has
        // a scan at this checkpoint
        CheckpointScan scan = checkpointScanRepository
                .findByParticipantIdAndCheckpointId(
                        participant.getId(),
                        checkpoint.getId())
                .orElse(null);

        // 6. Create new scan if one doesn't exist
        if (scan == null) {
            scan = new CheckpointScan();

            scan.setParticipant(participant);
            scan.setCheckpoint(checkpoint);
            scan.setVolunteer(volunteer);
        }

        // 7. Update scan information
        scan.setScanUuid(request.getScanUuid());
        scan.setScannedAt(LocalDateTime.now());
        scan.setDeviceId(request.getDeviceId());

        // 8. Save
        CheckpointScan savedScan = checkpointScanRepository.save(scan);

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