package com.tirfy.beats.repository;

import com.tirfy.beats.entity.CheckpointScan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CheckpointScanRepository
        extends JpaRepository<CheckpointScan, Long> {

    Optional<CheckpointScan> findByScanUuid(UUID scanUuid);

    Optional<CheckpointScan> findByParticipantIdAndCheckpointId(
            Long participantId,
            Long checkpointId
    );

    List<CheckpointScan> findByCheckpointId(Long checkpointId);

    List<CheckpointScan> findByParticipantIdOrderByScannedAtAsc(
            Long participantId
    );
}