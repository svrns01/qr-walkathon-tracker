package com.tirfy.beats.controller;

import com.tirfy.beats.dto.ScanSyncRequest;
import com.tirfy.beats.dto.ScanSyncResponse;
import com.tirfy.beats.service.ScanSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scans")
public class ScanSyncController {

    private final ScanSyncService scanSyncService;

    public ScanSyncController(ScanSyncService scanSyncService) {
        this.scanSyncService = scanSyncService;
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncScans(
            @RequestBody List<ScanSyncRequest> requests) {

        try {
            ScanSyncResponse response =
                    scanSyncService.syncScans(requests);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}