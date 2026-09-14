package com.tirfy.beats.service;

import com.tirfy.beats.entity.Participant;
import com.tirfy.beats.entity.ParticipantStatus;
import com.tirfy.beats.repository.ParticipantRepository;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class ParticipantImportService {

    private final ParticipantRepository participantRepository;

    public ParticipantImportService(ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    public int importParticipants(MultipartFile file) throws IOException {

        int importedCount = 0;

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);

            // Row 0 = header
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {

                Row row = sheet.getRow(rowIndex);

                if (row == null) {
                    continue;
                }

                String participantCode = getCellValue(row.getCell(0));
                String name = getCellValue(row.getCell(1));
                String ageValue = getCellValue(row.getCell(2));
                String gender = getCellValue(row.getCell(3));
                String qrToken = getCellValue(row.getCell(4));

                // Status, joined_at and dropped_out_at are intentionally
                // initialized by the application.
                // Columns 5, 6 and 7 are not required for initial import.

                if (participantCode.isBlank()
                        || name.isBlank()
                        || qrToken.isBlank()) {
                    continue;
                }

                // Prevent duplicate participant codes or QR tokens
                if (participantRepository.existsByParticipantCode(participantCode)
                        || participantRepository.existsByQrToken(qrToken)) {
                    continue;
                }

                Participant participant = new Participant();

                participant.setParticipantCode(participantCode);
                participant.setName(name);

                if (!ageValue.isBlank()) {
                    participant.setAge(Integer.parseInt(ageValue));
                }

                participant.setGender(gender);
                participant.setQrToken(qrToken);

                // Every newly imported participant starts here
                participant.setStatus(ParticipantStatus.NOT_STARTED);

                participantRepository.save(participant);

                importedCount++;
            }
        }

        return importedCount;
    }

    private String getCellValue(Cell cell) {

        if (cell == null) {
            return "";
        }

        DataFormatter formatter = new DataFormatter();

        return formatter.formatCellValue(cell).trim();
    }
}