package com.service;

import com.entity.User;
import com.enums.Role;
import com.exception.ResourceNotFoundException;
import com.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * UserService - Business logic layer for User operations.
 * Handles fetching users, login lookup by email, and deleting users.
 * Uses @Transactional to ensure database operations are atomic.
 */

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Get all users from the database
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /** Find a single user by their ID */
    @Transactional(readOnly = true)
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    /** Find a user by email address (used for login) */
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /** Get all users with a specific role */
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    /**
     * Authenticate a user by email and optional password.
     * If the account has no password set, email-only login succeeds.
     * Returns empty if the email is not found or the password does not match.
     */
    @Transactional(readOnly = true)
    public Optional<User> login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase().trim());
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }
        User user = userOpt.get();
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            String provided = password == null ? "" : password;
            if (!user.getPassword().equals(provided)) {
                return Optional.empty();
            }
        }
        return Optional.of(user);
    }

    /** Save a new user or update an existing user */
    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    /** Delete a user by ID - throws exception if user not found */
    @Transactional
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}