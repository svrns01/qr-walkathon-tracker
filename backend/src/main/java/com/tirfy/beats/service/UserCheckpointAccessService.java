package com.tirfy.beats.service;

import com.tirfy.beats.dto.CheckpointAccessRequest;
import com.tirfy.beats.dto.CheckpointAccessResponse;
import com.tirfy.beats.entity.User;
import com.tirfy.beats.entity.UserCheckpointAccess;
import com.tirfy.beats.repository.CheckpointRepository;
import com.tirfy.beats.repository.UserCheckpointAccessRepository;
import com.tirfy.beats.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserCheckpointAccessService {

    private final UserRepository userRepository;
    private final CheckpointRepository checkpointRepository;
    private final UserCheckpointAccessRepository userCheckpointAccessRepository;

    public UserCheckpointAccessService(
            UserRepository userRepository,
            CheckpointRepository checkpointRepository,
            UserCheckpointAccessRepository userCheckpointAccessRepository) {

        this.userRepository = userRepository;
        this.checkpointRepository = checkpointRepository;
        this.userCheckpointAccessRepository =
                userCheckpointAccessRepository;
    }
    public List<CheckpointAccessResponse> getAccessForUser(Long userId) {

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return userCheckpointAccessRepository
                .findByUserId(userId)
                .stream()
                .map(access -> new CheckpointAccessResponse(
                        access.getCheckpoint().getId(),
                        access.getCheckpoint().getName(),
                        access.getCheckpoint().getDayNumber(),
                        access.getCheckpoint().getSequenceNumber()
                ))
                .toList();
    }
    @Transactional
    public void updateAccess(
            Long userId,
            CheckpointAccessRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        if (request.getCheckpointIds() == null) {
            throw new RuntimeException(
                    "Checkpoint IDs are required");
        }
        List<Long> checkpointIds = request.getCheckpointIds();
        for (Long checkpointId : checkpointIds) {

            checkpointRepository.findById(checkpointId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Checkpoint not found: " + checkpointId));
        }
        userCheckpointAccessRepository.deleteByUserId(userId);
        userCheckpointAccessRepository.flush();
        for (Long checkpointId : checkpointIds) {

            var checkpoint = checkpointRepository
                    .findById(checkpointId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Checkpoint not found: " + checkpointId));

            UserCheckpointAccess access =
                    new UserCheckpointAccess();

            access.setUser(user);
            access.setCheckpoint(checkpoint);

            userCheckpointAccessRepository.save(access);
        }

    }
}