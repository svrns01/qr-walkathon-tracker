package com.tirfy.beats.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "checkpoint_scans",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_participant_checkpoint",
                        columnNames = {"participant_id", "checkpoint_id"}
                )
        }
)
public class CheckpointScan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "scan_uuid", nullable = false, unique = true)
    private UUID scanUuid;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "checkpoint_id", nullable = false)
    private Checkpoint checkpoint;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "volunteer_id", nullable = false)
    private User volunteer;

    @Column(name = "scanned_at", nullable = false)
    private LocalDateTime scannedAt;

    @Column(name = "device_id", length = 100)
    private String deviceId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public CheckpointScan() {
    }

    @PrePersist
    protected void onCreate() {
        if (scanUuid == null) {
            scanUuid = UUID.randomUUID();
        }

        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public UUID getScanUuid() {
        return scanUuid;
    }

    public void setScanUuid(UUID scanUuid) {
        this.scanUuid = scanUuid;
    }

    public Participant getParticipant() {
        return participant;
    }

    public void setParticipant(Participant participant) {
        this.participant = participant;
    }

    public Checkpoint getCheckpoint() {
        return checkpoint;
    }

    public void setCheckpoint(Checkpoint checkpoint) {
        this.checkpoint = checkpoint;
    }

    public User getVolunteer() {
        return volunteer;
    }

    public void setVolunteer(User volunteer) {
        this.volunteer = volunteer;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}