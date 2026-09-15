package com.tirfy.beats.controller;

import com.tirfy.beats.dto.CreateUserRequest;
import com.tirfy.beats.dto.UpdateUserRequest;
import com.tirfy.beats.dto.UserResponse;
import com.tirfy.beats.entity.User;
import com.tirfy.beats.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestBody CreateUserRequest request) {

        try {
            User user = userService.createUser(request);

            return ResponseEntity.ok(user);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestBody UpdateUserRequest request) {

        try {
            User user = userService.updateUser(userId, request);

            return ResponseEntity.ok(user);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
    @GetMapping
    public ResponseEntity<?> getAllUsers() {

        try {
            List<UserResponse> users =
                    userService.getAllUsers();

            return ResponseEntity.ok(users);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}