package com.tirfy.beats.dto;

import java.util.List;

public class CheckpointAccessRequest {

    private List<Long> checkpointIds;

    public CheckpointAccessRequest() {
    }

    public List<Long> getCheckpointIds() {
        return checkpointIds;
    }

    public void setCheckpointIds(List<Long> checkpointIds) {
        this.checkpointIds = checkpointIds;
    }
}