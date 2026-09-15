package com.tirfy.beats.dto;

public class CheckpointAccessResponse {

    private Long checkpointId;
    private String checkpointName;
    private Integer dayNumber;
    private Integer sequenceNumber;

    public CheckpointAccessResponse() {}

    public CheckpointAccessResponse(
            Long checkpointId,
            String checkpointName,
            Integer dayNumber,
            Integer sequenceNumber) {

        this.checkpointId = checkpointId;
        this.checkpointName = checkpointName;
        this.dayNumber = dayNumber;
        this.sequenceNumber = sequenceNumber;
    }

    public Long getCheckpointId() {
        return checkpointId;
    }

    public String getCheckpointName() {
        return checkpointName;
    }

    public Integer getDayNumber() {
        return dayNumber;
    }

    public Integer getSequenceNumber() {
        return sequenceNumber;
    }
}