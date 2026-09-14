package com.tirfy.beats.dto;

import java.util.UUID;

public class ScanRequest {

    private UUID scanUuid;
    private String qrToken;
    private String deviceId;

    public ScanRequest() {
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

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }
}