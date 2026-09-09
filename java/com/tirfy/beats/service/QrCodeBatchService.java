package com.tirfy.beats.service;

import com.google.zxing.WriterException;
import com.tirfy.beats.entity.Participant;
import com.tirfy.beats.repository.ParticipantRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class QrCodeBatchService {

    private final ParticipantRepository participantRepository;
    private final QrCodeService qrCodeService;

    public QrCodeBatchService(
            ParticipantRepository participantRepository,
            QrCodeService qrCodeService) {

        this.participantRepository = participantRepository;
        this.qrCodeService = qrCodeService;
    }

    public byte[] generateAllQrCodes()
            throws IOException, WriterException {

        List<Participant> participants =
                participantRepository.findAll();

        ByteArrayOutputStream zipOutput =
                new ByteArrayOutputStream();

        try (ZipOutputStream zip =
                     new ZipOutputStream(zipOutput)) {

            for (Participant participant : participants) {

                byte[] qrImage =
                        qrCodeService.generateQrCode(
                                participant.getQrToken(),
                                400,
                                400
                        );

                ZipEntry entry =
                        new ZipEntry(
                                participant.getParticipantCode()
                                        + ".png"
                        );

                zip.putNextEntry(entry);
                zip.write(qrImage);
                zip.closeEntry();
            }
        }

        return zipOutput.toByteArray();
    }
}