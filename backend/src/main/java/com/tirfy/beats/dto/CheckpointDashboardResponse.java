package com.tirfy.beats.dto;

import java.util.List;

public class CheckpointDashboardResponse {

    private Long checkpointId;
    private String checkpointName;

    private int totalActive;
    private int reached;
    private int yetToReach;
    private List<FastestLapResponse> fastestLaps;

    private List<ParticipantStatusResponse> reachedParticipants;
    private List<ParticipantStatusResponse> yetToReachParticipants;


    public CheckpointDashboardResponse() {
    }


    public CheckpointDashboardResponse(
            Long checkpointId,
            String checkpointName,
            int totalActive,
            int reached,
            int yetToReach,
            List<ParticipantStatusResponse> reachedParticipants,
            List<ParticipantStatusResponse> yetToReachParticipants,
            List<FastestLapResponse> fastestLaps) {

        this.checkpointId = checkpointId;
        this.checkpointName = checkpointName;
        this.totalActive = totalActive;
        this.reached = reached;
        this.yetToReach = yetToReach;
        this.reachedParticipants = reachedParticipants;
        this.yetToReachParticipants = yetToReachParticipants;
        this.fastestLaps = fastestLaps;
    }

    public List<FastestLapResponse> getFastestLaps() {
        return fastestLaps;
    }

    public Long getCheckpointId() {
        return checkpointId;
    }

    public String getCheckpointName() {
        return checkpointName;
    }

    public int getTotalActive() {
        return totalActive;
    }

    public int getReached() {
        return reached;
    }

    public int getYetToReach() {
        return yetToReach;
    }

    public List<ParticipantStatusResponse> getReachedParticipants() {
        return reachedParticipants;
    }

    public List<ParticipantStatusResponse> getYetToReachParticipants() {
        return yetToReachParticipants;
    }
}