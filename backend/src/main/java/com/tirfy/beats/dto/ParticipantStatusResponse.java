package com.tirfy.beats.dto;

import java.time.LocalDateTime;

public class ParticipantStatusResponse {

    private Long participantId;
    private String participantCode;
    private String participantName;
    private String status;
    private LocalDateTime scannedAt;
     

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
}