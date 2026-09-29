package com.tirfy.beats.service;

import com.tirfy.beats.dto.ScanRequest;
import com.tirfy.beats.dto.ScanResponse;
import com.tirfy.beats.entity.Checkpoint;
import com.tirfy.beats.entity.CheckpointScan;
import com.tirfy.beats.entity.Participant;
import com.tirfy.beats.entity.ParticipantStatus;
import com.tirfy.beats.entity.User;
import com.tirfy.beats.entity.UserRole;
import com.tirfy.beats.repository.CheckpointRepository;
import com.tirfy.beats.repository.CheckpointScanRepository;
import com.tirfy.beats.repository.ParticipantRepository;
import com.tirfy.beats.repository.UserCheckpointAccessRepository;
import com.tirfy.beats.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;

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

        // ==========================================
        // AUTHENTICATION
        // ==========================================

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

        User volunteer = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"));

        // ==========================================
        // USER ACTIVE CHECK
        // ==========================================

        if (!Boolean.TRUE.equals(
                volunteer.getIsActive())) {

            throw new RuntimeException(
                    "User account is inactive");
        }

        // ==========================================
        // CHECKPOINT
        // ==========================================

        Long checkpointId = Objects.requireNonNull(
                request.getCheckpointId(),
                "Checkpoint ID is required");

        Checkpoint checkpoint =
                checkpointRepository
                        .findById(checkpointId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Checkpoint not found"));

        // ==========================================
        // CHECKPOINT ACCESS
        //
        // ROOT  -> all checkpoints
        // ADMIN -> all checkpoints
        // VOLUNTEER -> assigned checkpoints only
        // ==========================================

        UserRole userRole =
                volunteer.getRole();

        if (userRole == UserRole.VOLUNTEER) {

            boolean hasAccess =
                    userCheckpointAccessRepository
                            .existsByUserIdAndCheckpointId(
                                    volunteer.getId(),
                                    checkpoint.getId());

            if (!hasAccess) {

                throw new RuntimeException(
                        "Volunteer is not authorized for this checkpoint");
            }
        }

        // ROOT and ADMIN bypass the checkpoint
        // access table and can scan at any checkpoint.

        // ==========================================
        // PARTICIPANT
        // ==========================================

        Participant participant =
                participantRepository
                        .findByQrToken(
                                request.getQrToken())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid QR code"));

// ==========================================
// PARTICIPANT LIFECYCLE CHECK
// ==========================================

        if (participant.getStatus() ==ParticipantStatus.DROPPED_OUT) {
                throw new RuntimeException("Participant has dropped out");
        }
        if (participant.getStatus() ==ParticipantStatus.COMPLETED) {
                throw new RuntimeException("Participant has already completed the walkathon");
        }

// NOT_STARTED participants can only start
// at the first checkpoint.
        if (participant.getStatus() ==ParticipantStatus.NOT_STARTED) {
                if (checkpoint.getSequenceNumber() != 1) {
                        throw new RuntimeException("Participant must start at the first checkpoint");
                }
                participant.setStatus(ParticipantStatus.ACTIVE);
        }
        // ==========================================
        // EXISTING SCAN
        //
        // Same participant + same checkpoint
        // = update existing scan
        // ==========================================

        CheckpointScan scan =
                checkpointScanRepository
                        .findByParticipantIdAndCheckpointId(
                                participant.getId(),
                                checkpoint.getId())
                        .orElse(null);

        if (scan == null) {

            scan = new CheckpointScan();

            scan.setParticipant(
                    participant);

            scan.setCheckpoint(
                    checkpoint);

            scan.setVolunteer(
                    volunteer);
        }

        // ==========================================
        // UPDATE SCAN
        // ==========================================

        scan.setScanUuid(
                request.getScanUuid());

        scan.setScannedAt(
                LocalDateTime.now());

        scan.setDeviceId(
                request.getDeviceId());
        

// ==========================================
// COMPLETE PARTICIPANT AT FINAL CHECKPOINT
// ==========================================

        if (checkpoint.getSequenceNumber() == 34) {
                participant.setStatus(ParticipantStatus.COMPLETED);
        }
        participantRepository.save(participant);

        // ==========================================
        // SAVE
        // ==========================================

        CheckpointScan savedScan =
                checkpointScanRepository.save(
                        scan);

        // ==========================================
        // SNS NOTIFICATION
        //
        // The scan has already been successfully
        // saved before SNS is attempted.
        //
        // If SNS fails, the scan remains successful
        // and is not rolled back.
        // ==========================================

        // ==========================================
        // RESPONSE
        // ==========================================

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