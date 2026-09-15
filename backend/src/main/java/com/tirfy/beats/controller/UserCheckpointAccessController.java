package com.tirfy.beats.controller;

import com.tirfy.beats.dto.CheckpointAccessRequest;
import com.tirfy.beats.dto.CheckpointAccessResponse;
import com.tirfy.beats.service.UserCheckpointAccessService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserCheckpointAccessController {

    private final UserCheckpointAccessService accessService;

    public UserCheckpointAccessController(
            UserCheckpointAccessService accessService) {
        this.accessService = accessService;
    }

    @GetMapping("/{userId}/checkpoints")
    public ResponseEntity<?> getUserCheckpoints(
            @PathVariable Long userId) {

        try {
            List<CheckpointAccessResponse> access =
                    accessService.getAccessForUser(userId);

            return ResponseEntity.ok(access);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{userId}/checkpoints")
    public ResponseEntity<?> updateUserCheckpoints(
            @PathVariable Long userId,
            @RequestBody CheckpointAccessRequest request) {

        try {
            accessService.updateAccess(userId, request);

            return ResponseEntity.ok(
                    "Checkpoint access updated successfully");

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}