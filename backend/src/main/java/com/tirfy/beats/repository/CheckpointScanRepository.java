package com.tirfy.beats.repository;

import com.tirfy.beats.entity.CheckpointScan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CheckpointScanRepository extends JpaRepository<CheckpointScan, Long> {

    Optional<CheckpointScan> findByScanUuid(java.util.UUID scanUuid);

    Optional<CheckpointScan> findByParticipantIdAndCheckpointId(
            Long participantId,
            Long checkpointId
    );
}