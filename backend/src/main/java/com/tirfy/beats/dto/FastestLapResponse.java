package com.tirfy.beats.dto;

public class FastestLapResponse {

    private Long participantId;
    private String participantCode;
    private String participantName;
    private Long previousCheckpointId;
    private Long currentCheckpointId;
    private long lapSeconds;

    public FastestLapResponse() {
    }

    public FastestLapResponse(
            Long participantId,
            String participantCode,
            String participantName,
            Long previousCheckpointId,
            Long currentCheckpointId,
            long lapSeconds) {

        this.participantId = participantId;
        this.participantCode = participantCode;
        this.participantName = participantName;
        this.previousCheckpointId = previousCheckpointId;
        this.currentCheckpointId = currentCheckpointId;
        this.lapSeconds = lapSeconds;
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

    public Long getPreviousCheckpointId() {
        return previousCheckpointId;
    }

    public Long getCurrentCheckpointId() {
        return currentCheckpointId;
    }

    public long getLapSeconds() {
        return lapSeconds;
    }
}