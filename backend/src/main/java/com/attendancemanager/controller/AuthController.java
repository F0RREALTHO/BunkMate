package com.attendancemanager.controller;

import com.attendancemanager.dto.request.LoginRequest;
import com.attendancemanager.dto.request.RegisterRequest;
import com.attendancemanager.dto.response.AuthResponse;
import com.attendancemanager.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        var user = authService.getUserById(userId);
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateMe(Authentication authentication, @Valid @RequestBody com.attendancemanager.dto.request.UpdateUserRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        var user = authService.updateUser(userId, request);
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
        ));
    }
}
