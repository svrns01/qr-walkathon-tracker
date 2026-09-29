package com.tirfy.beats.dto;

import java.time.LocalDateTime;

public class ParticipantStatusResponse {

    private Long participantId;
    private String participantCode;
    private String participantName;
    private String status;
    private LocalDateTime scannedAt;
    private String role;


    public ParticipantStatusResponse(
            Long participantId,
            String participantCode,
            String participantName,
            String status,
            LocalDateTime scannedAt) {

        this.participantId = participantId;
        this.participantCode = participantCode;
        this.participantName = participantName;
        this.status = status;
        this.scannedAt = scannedAt;
    }

    public ParticipantStatusResponse(
            Long participantId,
            String participantCode,
            String participantName,
            String status,
            LocalDateTime scannedAt,
            String role) {

        this.participantId = participantId;
        this.participantCode = participantCode;
        this.participantName = participantName;
        this.status = status;
        this.scannedAt = scannedAt;
        this.role = role;
    }


    public Long getParticipantId() {
        return participantId;
    }

    public String getParticipantCode() {
        return participantCode;
    }

    public String getParticipantName() {
        return participantName;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getScannedAt() {
        return scannedAt;
    }

    public String getRole() {
        return role;
    }
}