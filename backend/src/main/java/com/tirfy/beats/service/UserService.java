package com.tirfy.beats.service;

import com.tirfy.beats.dto.CreateUserRequest;
import com.tirfy.beats.dto.UpdateUserRequest;
import com.tirfy.beats.dto.UserResponse;
import com.tirfy.beats.entity.User;
import com.tirfy.beats.entity.UserRole;
import com.tirfy.beats.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(CreateUserRequest request) {

        if (request.getName() == null ||
                request.getName().isBlank()) {
            throw new RuntimeException("Name is required");
        }

        if (request.getEmail() == null ||
                request.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }

        if (request.getPassword() == null ||
                request.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }

        if (request.getRole() == null) {
            throw new RuntimeException("Role is required");
        }

        if (request.getRole() == UserRole.ROOT) {
            throw new RuntimeException(
                    "ROOT users cannot be created through this API");
        }

        if (userRepository.findByEmail(request.getEmail())
                .isPresent()) {
            throw new RuntimeException(
                    "Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setIsActive(true);

        return userRepository.save(user);
    }
    public User updateUser(
            Long userId,
            UpdateUserRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (request.getName() == null ||
                request.getName().isBlank()) {
            throw new RuntimeException("Name is required");
        }

        if (request.getEmail() == null ||
                request.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }

        if (request.getRole() == null) {
            throw new RuntimeException("Role is required");
        }

        if (request.getRole() == UserRole.ROOT) {
            throw new RuntimeException(
                    "ROOT role cannot be assigned");
        }

        userRepository.findByEmail(request.getEmail())
                .ifPresent(existingUser -> {
                    if (!existingUser.getId().equals(userId)) {
                        throw new RuntimeException(
                                "Email already exists");
                    }
                });

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        if (request.getPassword() != null &&
                !request.getPassword().isBlank()) {

            user.setPasswordHash(
                    passwordEncoder.encode(
                            request.getPassword()));
        }

        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        return userRepository.save(user);
    }
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getIsActive()
                ))
                .toList();
    }
}