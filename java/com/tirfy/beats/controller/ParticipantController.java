package com.tirfy.beats.controller;

import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.tirfy.beats.service.ParticipantImportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.tirfy.beats.repository.ParticipantRepository;
import java.util.Map;
import com.tirfy.beats.entity.Participant;
import com.tirfy.beats.entity.ParticipantStatus;
import java.util.Map;
import com.tirfy.beats.entity.ParticipantStatus;
@RestController
@RequestMapping("/api/participants")
public class ParticipantController {

    private final ParticipantImportService participantImportService;
    private final ParticipantRepository participantRepository;

    public ParticipantController(
            ParticipantImportService participantImportService,
            ParticipantRepository participantRepository) {

        this.participantImportService = participantImportService;
        this.participantRepository = participantRepository;
    }
    @GetMapping
    public ResponseEntity<?> getAllParticipants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable =
                PageRequest.of(page, size, Sort.by("id").ascending());

        return ResponseEntity.ok(
                participantRepository.findAll(pageable)
        );
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getParticipantById(@PathVariable Long id) {
        return participantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createParticipant(
            @Valid @RequestBody Participant participant) {

        if (participantRepository.existsByParticipantCode(
                participant.getParticipantCode())) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Participant code already exists"
                    ));
        }

        if (participantRepository.existsByQrToken(
                participant.getQrToken())) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "QR token already exists"
                    ));
        }

        participant.setStatus(ParticipantStatus.NOT_STARTED);

        Participant savedParticipant =
                participantRepository.save(participant);

        return ResponseEntity.ok(savedParticipant);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateParticipant(
            @PathVariable Long id,
            @Valid @RequestBody Participant updatedParticipant) {

        return participantRepository.findById(id)
                .map(existingParticipant -> {

                    existingParticipant.setParticipantCode(
                            updatedParticipant.getParticipantCode());

                    existingParticipant.setName(
                            updatedParticipant.getName());

                    existingParticipant.setAge(
                            updatedParticipant.getAge());

                    existingParticipant.setGender(
                            updatedParticipant.getGender());

                    existingParticipant.setQrToken(
                            updatedParticipant.getQrToken());

                    Participant savedParticipant =
                            participantRepository.save(existingParticipant);

                    return ResponseEntity.ok(savedParticipant);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateParticipantStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        return participantRepository.findById(id)
                .map(participant -> {

                    String statusValue = request.get("status");

                    ParticipantStatus newStatus;

                    try {
                        newStatus = ParticipantStatus.valueOf(statusValue);
                    } catch (Exception e) {
                        return ResponseEntity.badRequest()
                                .body(Map.of(
                                        "message",
                                        "Invalid status: " + statusValue
                                ));
                    }

                    ParticipantStatus currentStatus =
                            participant.getStatus();

                    boolean allowed =
                            (currentStatus == ParticipantStatus.NOT_STARTED
                                    && newStatus == ParticipantStatus.ACTIVE)
                                    ||
                                    (currentStatus == ParticipantStatus.ACTIVE
                                            && (newStatus == ParticipantStatus.DROPPED_OUT
                                            || newStatus == ParticipantStatus.COMPLETED))
                                    ||
                                    (currentStatus == ParticipantStatus.DROPPED_OUT
                                            && newStatus == ParticipantStatus.ACTIVE);

                    if (!allowed) {
                        return ResponseEntity.badRequest()
                                .body(Map.of(
                                        "message",
                                        "Invalid status transition from "
                                                + currentStatus
                                                + " to "
                                                + newStatus
                                ));
                    }

                    participant.setStatus(newStatus);

                    if (newStatus == ParticipantStatus.DROPPED_OUT) {
                        participant.setDroppedOutAt(java.time.LocalDateTime.now());
                    }

                    if (newStatus == ParticipantStatus.ACTIVE) {
                        participant.setDroppedOutAt(null);
                    }

                    Participant savedParticipant =
                            participantRepository.save(participant);
                    return ResponseEntity.ok(savedParticipant);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchParticipants(
            @RequestParam String query) {

        return ResponseEntity.ok(
                participantRepository
                        .findByNameContainingIgnoreCaseOrParticipantCodeContainingIgnoreCase(
                                query, query)
        );
    }

    @PostMapping("/import")
    public ResponseEntity<?> importParticipants(
            @RequestParam("file") MultipartFile file) {

        try {
            int importedCount =
                    participantImportService.importParticipants(file);

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Participants imported successfully",
                            "importedCount", importedCount
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message", "Import failed",
                            "error", e.getMessage()
                    )
            );
        }
    }
}