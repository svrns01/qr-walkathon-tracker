package com.tirfy.beats.controller;

import com.tirfy.beats.service.ParticipantImportService;
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
    public ResponseEntity<?> getAllParticipants() {
        return ResponseEntity.ok(
                participantRepository.findAll()
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
            @RequestBody Participant participant) {

        participant.setStatus(ParticipantStatus.NOT_STARTED);

        Participant savedParticipant =
                participantRepository.save(participant);

        return ResponseEntity.ok(savedParticipant);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateParticipant(
            @PathVariable Long id,
            @RequestBody Participant updatedParticipant) {

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

                    ParticipantStatus status =
                            ParticipantStatus.valueOf(statusValue);

                    participant.setStatus(status);

                    Participant savedParticipant =
                            participantRepository.save(participant);

                    return ResponseEntity.ok(savedParticipant);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
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