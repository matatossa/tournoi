package com.tournament.controller;

import com.tournament.model.User;
import com.tournament.security.JwtUtil;
import com.tournament.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import com.tournament.model.User.Role;
import com.tournament.model.Team;
import com.tournament.repository.TeamRepository;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final TeamRepository teamRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            log.info("Registration attempt for username: {}", request.getUsername());
            if (userService.existsByUsername(request.getUsername())) {
                log.warn("Registration failed: Username already exists - {}", request.getUsername());
                return ResponseEntity.badRequest().body("Username already exists");
            }

            User user = new User();
            user.setUsername(request.getUsername());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            User savedUser = userService.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful");
            response.put("redirectTo", "/login");
            response.put("user", savedUser);

            log.info("Registration successful for user: {}", savedUser.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Registration failed", e);
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody RegisterRequest request) {
        if (userService.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ADMIN);
        User savedUser = userService.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/register-team")
    public ResponseEntity<?> registerTeam(@RequestBody RegisterTeamRequest request) {
        if (userService.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        Team team = new Team();
        team.setName(request.getTeamName());
        team.setCity(request.getCity());
        team.setCountry(request.getCountry());
        Team savedTeam = teamRepository.save(team);
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.TEAM);
        user.setTeam(savedTeam);
        User savedUser = userService.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String username = request.getUsername();
        String password = request.getPassword();
        try {
            log.info("Login attempt - Username: '{}', Password length: {}", username, password != null ? password.length() : 0);

            if (username == null || username.trim().isEmpty()) {
                log.warn("Login failed: Username is empty");
                return ResponseEntity.badRequest().body("Username cannot be empty");
            }

            if (password == null || password.trim().isEmpty()) {
                log.warn("Login failed: Password is empty");
                return ResponseEntity.badRequest().body("Password cannot be empty");
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            User user = (User) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
            if (user.getRole() == Role.TEAM && user.getTeam() != null) {
                response.put("teamId", user.getTeam().getId());
            }

            log.info("Login successful for user: {} - JWT issued", user.getUsername());
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            log.warn("Login failed for user: {} - Invalid credentials", username);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        } catch (Exception e) {
            log.error("Login failed for user: " + username, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during login");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        User user = (User) authentication.getPrincipal();
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("role", user.getRole());
        if (user.getRole() == Role.TEAM && user.getTeam() != null) {
            response.put("teamId", user.getTeam().getId());
        }
        return ResponseEntity.ok(response);
    }
}

@lombok.Data
class RegisterRequest {
    private String username;
    private String password;
}

@lombok.Data
class LoginRequest {
    private String username;
    private String password;
}

@lombok.Data
class RegisterTeamRequest {
    private String username;
    private String password;
    private String teamName;
    private String city;
    private String country;
} 