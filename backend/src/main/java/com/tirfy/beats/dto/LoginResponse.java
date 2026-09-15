package com.tirfy.beats.dto;

import java.util.List;

public class LoginResponse {

    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private List<Long> assignedCheckpointIds;

    public LoginResponse() {
    }

    public LoginResponse(
            String token,
            Long userId,
            String name,
            String email,
            String role,
            List<Long> assignedCheckpointIds) {

        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.assignedCheckpointIds = assignedCheckpointIds;
    }

    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public List<Long> getAssignedCheckpointIds() {
        return assignedCheckpointIds;
    }
}