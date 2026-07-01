package com.controller;

import com.dto.LoginRequest;
import com.dto.OnboardingRequest;
import com.dto.PasswordRequest;
import com.entity.User;
import com.enums.Role;
import com.exception.ResourceNotFoundException;
import com.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/users/login
     * If the account has a password set, the password must match.
     * If no password is set, email-only login still works (backwards compatible).
     * Auto-creates a new MEMBER account for unknown emails (SLIIT self-registration flow).
     */
    /** GET /api/users/check-email?email=... — returns { exists, hasPassword } so the frontend can decide which step to show */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        var user = userService.getUserByEmail(email.toLowerCase().trim());
        boolean exists = user.isPresent();
        boolean hasPassword = exists && user.get().getPassword() != null && !user.get().getPassword().isBlank();
        return ResponseEntity.ok(java.util.Map.of("exists", exists, "hasPassword", hasPassword));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        String email = req.getEmail().toLowerCase().trim();

        var existing = userService.getUserByEmail(email);
        if (existing.isPresent()) {
            var authenticated = userService.login(email, req.getPassword());
            if (authenticated.isEmpty()) {
                return ResponseEntity.status(401)
                        .body(java.util.Map.of("message", "Invalid password"));
            }
            return ResponseEntity.ok(authenticated.get());
        }

        // Auto-create new member (SLIIT student self-registration)
        User newUser = new User();
        String studentId = extractStudentId(email);
        newUser.setId(studentId != null ? studentId : java.util.UUID.randomUUID().toString().substring(0, 8));
        newUser.setEmail(email);
        newUser.setName("");
        newUser.setRole(Role.MEMBER);
        newUser.setStudentId(studentId);
        newUser.setOnboarded(false);
        return ResponseEntity.ok(userService.saveUser(newUser));
    }

    @PutMapping("/{id}/onboard")
    public ResponseEntity<User> completeOnboarding(@PathVariable String id,
                                                   @Valid @RequestBody OnboardingRequest req) {
        return userService.getUserById(id)
                .map(user -> {
                    user.setName(req.getName());
                    user.setBirthday(req.getBirthday());
                    user.setOnboarded(true);
                    return ResponseEntity.ok(userService.saveUser(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/users/{id}/password — Admin sets or changes a user's password.
     * Stores plain text (academic project — no BCrypt to keep it simple).
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<User> setPassword(@PathVariable String id,
                                            @Valid @RequestBody PasswordRequest req) {
        User user = userService.getUserById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setPassword(req.getPassword());
        return ResponseEntity.ok(userService.saveUser(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    private String extractStudentId(String email) {
        if (email != null && email.endsWith("@my.sliit.lk")) {
            String local = email.split("@")[0];
            if (local.matches("[a-zA-Z]{2}\\d{8}")) {
                return local.toUpperCase();
            }
        }
        return null;
    }
}