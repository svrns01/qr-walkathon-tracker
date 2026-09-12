package com.tirfy.beats.controller;

import com.tirfy.beats.entity.Checkpoint;
import com.tirfy.beats.repository.CheckpointRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checkpoints")
public class CheckpointController {

    private final CheckpointRepository checkpointRepository;

    public CheckpointController(CheckpointRepository checkpointRepository) {
        this.checkpointRepository = checkpointRepository;
    }

    // Get all checkpoints
    @GetMapping
    public ResponseEntity<List<Checkpoint>> getAllCheckpoints() {
        return ResponseEntity.ok(
                checkpointRepository.findAllByOrderByDayNumberAscSequenceNumberAsc()
        );
    }

    // Get checkpoints for a specific day
    @GetMapping("/day/{dayNumber}")
    public ResponseEntity<List<Checkpoint>> getCheckpointsByDay(
            @PathVariable Integer dayNumber) {

        return ResponseEntity.ok(
                checkpointRepository.findByDayNumberOrderBySequenceNumber(dayNumber)
        );
    }

    // Get one checkpoint by ID
    @GetMapping("/{id}")
    public ResponseEntity<Checkpoint> getCheckpointById(
            @PathVariable Long id) {

        return checkpointRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCheckpoint(
            @RequestBody Checkpoint checkpoint) {

        // Check for duplicate day + sequence
        if (checkpointRepository.existsByDayNumberAndSequenceNumber(
                checkpoint.getDayNumber(),
                checkpoint.getSequenceNumber())) {

            return ResponseEntity.badRequest()
                    .body("Checkpoint with this day and sequence already exists");
        }

        // New checkpoints are active by default
        checkpoint.setIsActive(true);

        Checkpoint savedCheckpoint = checkpointRepository.save(checkpoint);

        return ResponseEntity.ok(savedCheckpoint);
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCheckpoint(
            @PathVariable Long id,
            @RequestBody Checkpoint updatedCheckpoint) {

        return checkpointRepository.findById(id)
                .map(existingCheckpoint -> {

                    // Check if another checkpoint already uses
                    // the requested day + sequences
                    boolean duplicate = checkpointRepository
                            .existsByDayNumberAndSequenceNumber(
                                    updatedCheckpoint.getDayNumber(),
                                    updatedCheckpoint.getSequenceNumber()
                            );

                    // If the requested combination belongs to another checkpoint
                    if (duplicate &&
                            (!existingCheckpoint.getDayNumber()
                                    .equals(updatedCheckpoint.getDayNumber())
                                    || !existingCheckpoint.getSequenceNumber()
                                    .equals(updatedCheckpoint.getSequenceNumber()))) {

                        return ResponseEntity.badRequest()
                                .body("Another checkpoint already uses this day and sequence");
                    }

                    existingCheckpoint.setDayNumber(
                            updatedCheckpoint.getDayNumber()
                    );

                    existingCheckpoint.setSequenceNumber(
                            updatedCheckpoint.getSequenceNumber()
                    );

                    existingCheckpoint.setName(
                            updatedCheckpoint.getName()
                    );

                    existingCheckpoint.setScheduledTime(
                            updatedCheckpoint.getScheduledTime()
                    );

                    existingCheckpoint.setLocation(
                            updatedCheckpoint.getLocation()
                    );

                    Checkpoint savedCheckpoint =
                            checkpointRepository.save(existingCheckpoint);

                    return ResponseEntity.ok(savedCheckpoint);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateCheckpointStatus(
            @PathVariable Long id,
            @RequestParam Boolean active) {

        return checkpointRepository.findById(id)
                .map(checkpoint -> {

                    checkpoint.setIsActive(active);

                    Checkpoint savedCheckpoint =
                            checkpointRepository.save(checkpoint);

                    return ResponseEntity.ok(savedCheckpoint);
                })
                .orElse(ResponseEntity.notFound().build());
    }

}
