package com.tirfy.beats.repository;

import com.tirfy.beats.entity.UserCheckpointAccess;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserCheckpointAccessRepository
        extends JpaRepository<UserCheckpointAccess, Long> {

    List<UserCheckpointAccess> findByUserId(Long userId);

    boolean existsByUserIdAndCheckpointId(
            Long userId,
            Long checkpointId);

    void deleteByUserId(Long userId);
}

