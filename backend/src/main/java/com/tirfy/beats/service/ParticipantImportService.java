package com.tirfy.beats.service;

import com.tirfy.beats.entity.Participant;
import com.tirfy.beats.entity.ParticipantStatus;
import com.tirfy.beats.repository.ParticipantRepository;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class ParticipantImportService {

    private final ParticipantRepository participantRepository;

    public ParticipantImportService(
            ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    public int importParticipants(MultipartFile file)
            throws IOException {

        int importedCount = 0;

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook =
                     WorkbookFactory.create(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);

            // --------------------------------------------
            // Read header row
            // --------------------------------------------

            Row headerRow = sheet.getRow(0);

            if (headerRow == null) {
                throw new RuntimeException(
                        "Excel header row is missing");
            }

            Map<String, Integer> columns =
                    new HashMap<>();

            for (Cell cell : headerRow) {

                String header =
                        getCellValue(cell)
                                .toLowerCase()
                                .trim();

                if (!header.isBlank()) {
                    columns.put(header, cell.getColumnIndex());
                }
            }

            // --------------------------------------------
            // Required columns
            // --------------------------------------------

            requireColumn(columns, "name");
            requireColumn(columns, "age");
            requireColumn(columns, "gender");
            requireColumn(columns, "participant_code");
            requireColumn(columns, "qr_token");
            requireColumn(columns, "role");

            // --------------------------------------------
            // Process participant rows
            // --------------------------------------------

            for (int rowIndex = 1;
                 rowIndex <= sheet.getLastRowNum();
                 rowIndex++) {

                Row row = sheet.getRow(rowIndex);

                if (row == null) {
                    continue;
                }

                String participantCode =
                        getCellValue(
                                row.getCell(
                                        columns.get(
                                                "participant_code")));

                String name =
                        getCellValue(
                                row.getCell(
                                        columns.get("name")));

                String ageValue =
                        getCellValue(
                                row.getCell(
                                        columns.get("age")));

                String gender =
                        getCellValue(
                                row.getCell(
                                        columns.get("gender")));

                String qrToken =
                        getCellValue(
                                row.getCell(
                                        columns.get("qr_token")));

                String role =
                        getCellValue(
                                row.getCell(
                                        columns.get("role")));

                // ----------------------------------------
                // Validate required values
                // ----------------------------------------

                if (participantCode.isBlank()
                        || name.isBlank()
                        || qrToken.isBlank()
                        || role.isBlank()) {

                    continue;
                }

                // ----------------------------------------
                // Prevent duplicate participant codes
                // ----------------------------------------

                if (participantRepository
                        .existsByParticipantCode(
                                participantCode)) {

                    continue;
                }

                // ----------------------------------------
                // Prevent duplicate QR tokens
                // ----------------------------------------

                if (participantRepository
                        .existsByQrToken(qrToken)) {

                    continue;
                }

                // ----------------------------------------
                // Create participant
                // ----------------------------------------

                Participant participant =
                        new Participant();

                participant.setParticipantCode(
                        participantCode);

                participant.setName(name);

                if (!ageValue.isBlank()) {
                    participant.setAge(
                            Integer.parseInt(ageValue));
                }

                participant.setGender(gender);

                participant.setQrToken(qrToken);

                participant.setRole(role);

                // Application-managed status
                participant.setStatus(
                        ParticipantStatus.NOT_STARTED);

                participantRepository.save(
                        participant);

                importedCount++;
            }
        }

        return importedCount;
    }

    // --------------------------------------------
    // Find required Excel column
    // --------------------------------------------

    private void requireColumn(
            Map<String, Integer> columns,
            String columnName) {

        if (!columns.containsKey(columnName)) {
            throw new RuntimeException(
                    "Required Excel column missing: "
                            + columnName);
        }
    }

    // --------------------------------------------
    // Read Excel cell safely
    // --------------------------------------------

    private String getCellValue(Cell cell) {

        if (cell == null) {
            return "";
        }

        DataFormatter formatter =
                new DataFormatter();

        return formatter
                .formatCellValue(cell)
                .trim();
    }
}