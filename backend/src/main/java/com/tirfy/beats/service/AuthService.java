package com.tirfy.beats.service;

import com.tirfy.beats.dto.LoginRequest;
import com.tirfy.beats.dto.LoginResponse;
import com.tirfy.beats.entity.User;
import com.tirfy.beats.repository.UserCheckpointAccessRepository;
import com.tirfy.beats.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserCheckpointAccessRepository
            userCheckpointAccessRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            UserCheckpointAccessRepository
                    userCheckpointAccessRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.userCheckpointAccessRepository =
                userCheckpointAccessRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException(
                    "User account is inactive");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {

            throw new RuntimeException(
                    "Invalid email or password");
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        List<Long> assignedCheckpointIds =
                userCheckpointAccessRepository
                        .findByUserId(user.getId())
                        .stream()
                        .map(access ->
                                access.getCheckpoint().getId())
                        .toList();

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                assignedCheckpointIds
        );
    }
}