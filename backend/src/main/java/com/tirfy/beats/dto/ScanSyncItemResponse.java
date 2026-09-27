package com.tirfy.beats.dto;

import java.util.UUID;

public class ScanSyncItemResponse {

    private UUID scanUuid;
    private boolean accepted;
    private String message;

    public ScanSyncItemResponse() {
    }

    public ScanSyncItemResponse(
            UUID scanUuid,
            boolean accepted,
            String message) {

        this.scanUuid = scanUuid;
        this.accepted = accepted;
        this.message = message;
    }

    public UUID getScanUuid() {
        return scanUuid;
    }

    public boolean isAccepted() {
        return accepted;
    }

    public String getMessage() {
        return message;
    }
}