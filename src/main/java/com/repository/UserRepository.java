package com.repository;

import com.entity.User;
import com.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository - Database access layer for User entity.
 * Extends JpaRepository which provides built-in methods: findAll(), findById(), save(), deleteById(), etc.
 * Custom query methods below are automatically implemented by Spring Data JPA based on method name.
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    /** Find a user by their email address (used for login) */
    Optional<User> findByEmail(String email);

    /** Find all users with a specific role (ADMIN, INSTRUCTOR, or MEMBER) */
    List<User> findByRole(Role role);
}

