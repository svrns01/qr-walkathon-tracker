package com.tirfy.beats.controller;

import com.google.zxing.WriterException;
import com.tirfy.beats.entity.Participant;
import com.tirfy.beats.repository.ParticipantRepository;
import com.tirfy.beats.service.QrCodeBatchService;
import com.tirfy.beats.service.QrCodeService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/participants")
public class QrCodeController {

    private final ParticipantRepository participantRepository;
    private final QrCodeService qrCodeService;
    private final QrCodeBatchService qrCodeBatchService;

    public QrCodeController(
            ParticipantRepository participantRepository,
            QrCodeService qrCodeService,
            QrCodeBatchService qrCodeBatchService) {

        this.participantRepository = participantRepository;
        this.qrCodeService = qrCodeService;
        this.qrCodeBatchService = qrCodeBatchService;
    }

    @GetMapping("/qr/all")
    public ResponseEntity<byte[]> generateAllQrCodes()
            throws IOException, WriterException {

        byte[] zipFile = qrCodeBatchService.generateAllQrCodes();

        return ResponseEntity.ok()
                .header(
                        "Content-Disposition",
                        "attachment; filename=\"qr-codes.zip\""
                )
                .contentType(
                        MediaType.APPLICATION_OCTET_STREAM
                )
                .body(zipFile);
    }

    @GetMapping("/{id}/qr")
    public ResponseEntity<byte[]> generateQrCode(
            @PathVariable Long id) throws WriterException, IOException {

        Participant participant = participantRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Participant not found"));

        byte[] qrCode = qrCodeService.generateQrCode(
                participant.getQrToken(),
                400,
                400
        );

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qrCode);
    }
}