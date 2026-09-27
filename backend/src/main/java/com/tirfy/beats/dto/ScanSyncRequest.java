package com.tirfy.beats.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ScanSyncRequest {

    private UUID scanUuid;
    private String qrToken;
    private Long participantId;
    private Long checkpointId;
    private LocalDateTime scannedAt;
    private String deviceId;

    public ScanSyncRequest() {
    }

    public UUID getScanUuid() {
        return scanUuid;
    }

    public void setScanUuid(UUID scanUuid) {
        this.scanUuid = scanUuid;
    }

    public String getQrToken() {
        return qrToken;
    }

    public void setQrToken(String qrToken) {
        this.qrToken = qrToken;
    }

    public Long getParticipantId() {
        return participantId;
    }

    public void setParticipantId(Long participantId) {
        this.participantId = participantId;
    }

    public Long getCheckpointId() {
        return checkpointId;
    }

    public void setCheckpointId(Long checkpointId) {
        this.checkpointId = checkpointId;
    }

    public LocalDateTime getScannedAt() {
        return scannedAt;
    }

    public void setScannedAt(LocalDateTime scannedAt) {
        this.scannedAt = scannedAt;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }
}