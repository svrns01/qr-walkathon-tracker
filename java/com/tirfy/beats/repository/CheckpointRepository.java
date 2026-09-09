package com.tirfy.beats.repository;

import com.tirfy.beats.entity.Checkpoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CheckpointRepository extends JpaRepository<Checkpoint, Long> {

    List<Checkpoint> findByDayNumberOrderBySequenceNumber(Integer dayNumber);

    boolean existsByDayNumberAndSequenceNumber(
            Integer dayNumber,
            Integer sequenceNumber
    );
}
