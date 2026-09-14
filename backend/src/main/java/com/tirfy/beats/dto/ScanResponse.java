package com.tirfy.beats.dto;

import java.time.LocalDateTime;
import java.util.UUID;


public class ScanResponse {

    private Long scanId;
    private UUID scanUuid;
    private Long participantId;
    private String participantCode;
    private String participantName;
    private Long checkpointId;
    private String checkpointName;
    private LocalDateTime scannedAt;

    public ScanResponse() {
    }

    public ScanResponse(
            Long scanId,
            UUID scanUuid,
            Long participantId,
            String participantCode,
            String participantName,
            Long checkpointId,
            String checkpointName,
            LocalDateTime scannedAt) {

        this.scanId = scanId;
        this.scanUuid = scanUuid;
        this.participantId = participantId;
        this.participantCode = participantCode;
        this.participantName = participantName;
        this.checkpointId = checkpointId;
        this.checkpointName = checkpointName;
        this.scannedAt = scannedAt;
    }

    public Long getScanId() {
        return scanId;
    }

    public UUID getScanUuid() {
        return scanUuid;
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

    public Long getCheckpointId() {
        return checkpointId;
    }

    public String getCheckpointName() {
        return checkpointName;
    }

    public LocalDateTime getScannedAt() {
        return scannedAt;
    }
}