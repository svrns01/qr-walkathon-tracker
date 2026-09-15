package com.tirfy.beats.dto;

import com.tirfy.beats.entity.UserRole;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private Boolean isActive;

    public UserResponse() {}

    public UserResponse(
            Long id,
            String name,
            String email,
            UserRole role,
            Boolean isActive) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.isActive = isActive;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }

    public Boolean getIsActive() {
        return isActive;
    }
}