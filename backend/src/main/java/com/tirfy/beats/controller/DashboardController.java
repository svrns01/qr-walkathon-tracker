package com.tirfy.beats.controller;

import com.tirfy.beats.dto.CheckpointDashboardResponse;
import com.tirfy.beats.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/checkpoints/{checkpointId}")
    public ResponseEntity<CheckpointDashboardResponse>
    getCheckpointDashboard(
            @PathVariable Long checkpointId) {

        return ResponseEntity.ok(
                dashboardService
                        .getCheckpointDashboard(checkpointId)
        );
    }
}