package com.joblens.user.controller;

import com.joblens.user.dto.AuthResponse;
import com.joblens.user.dto.ChangePasswordRequest;
import com.joblens.user.dto.LoginRequest;
import com.joblens.user.dto.SignupRequest;
import com.joblens.user.dto.UserResponse;
import com.joblens.user.model.User;
import com.joblens.user.repository.UserRepository;
import com.joblens.user.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        if (request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email and password are required"));
        }
        if (userRepository.existsByEmail(request.email().trim())) {
            return ResponseEntity.status(409)
                    .body(Map.of("error", "An account with that email already exists"));
        }
        User user = User.builder()
                .email(request.email().trim())
                .password(passwordEncoder.encode(request.password()))
                .name(request.name())
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.status(201)
                .body(new AuthResponse(token, user.getEmail(), user.getName()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.email() == null || request.password() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email and password are required"));
        }
        Optional<User> userOpt = userRepository.findByEmail(request.email().trim());
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.password(), userOpt.get().getPassword())) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid email or password"));
        }
        User user = userOpt.get();
        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getName()));
    }

    // Protected — requires valid Bearer token
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow();
        return ResponseEntity.ok(new UserResponse(user.getEmail(), user.getName()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody ChangePasswordRequest request) {

        if (request.currentPassword() == null || request.newPassword() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "currentPassword and newPassword are required"));
        }
        if (request.newPassword().length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "New password must be at least 8 characters"));
        }

        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Current password is incorrect"));
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
