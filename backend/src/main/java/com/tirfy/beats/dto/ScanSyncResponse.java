package com.tirfy.beats.dto;

import java.util.List;

public class ScanSyncResponse {

    private int total;
    private int accepted;
    private int rejected;
    private List<ScanSyncItemResponse> results;

    public ScanSyncResponse() {
    }

    public ScanSyncResponse(
            int total,
            int accepted,
            int rejected,
            List<ScanSyncItemResponse> results) {

        this.total = total;
        this.accepted = accepted;
        this.rejected = rejected;
        this.results = results;
    }

    public int getTotal() {
        return total;
    }

    public int getAccepted() {
        return accepted;
    }

    public int getRejected() {
        return rejected;
    }

    public List<ScanSyncItemResponse> getResults() {
        return results;
    }
}