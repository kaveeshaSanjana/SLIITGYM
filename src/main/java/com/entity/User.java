package com.entity;

import com.enums.Role;
import jakarta.persistence.*;

/**
 * User entity - Base class for all users in the gym system.
 * Uses JOINED inheritance so Member and Instructor extend this table.
 * Each user has a unique email and a role (ADMIN, INSTRUCTOR, or MEMBER).
 */
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
public class User {

    @Id
    private String id;

    /** Full name of the user */
    @Column(nullable = false)
    private String name;

    /** Email address - must be unique across all users */
    @Column(nullable = false, unique = true)
    private String email;

    /** Role determines what the user can access (ADMIN, INSTRUCTOR, MEMBER) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /** URL to the user's profile picture (optional) */
    private String avatar;

    /** Student ID extracted from SLIIT email (e.g. IT25103104) */
    private String studentId;

    /** Date of birth in yyyy-MM-dd format */
    private String birthday;

    /** Whether the user has completed onboarding */
    @Column(nullable = false)
    private boolean onboarded = false;

    /** Hashed password — null means no password set (email-only login still works) */
    private String password;

    // ===================== Constructors =====================

    /** Default no-argument constructor (required by JPA) */
    public User() {
    }

    /** All-arguments constructor for creating a complete User */
    public User(String id, String name, String email, Role role, String avatar,
                String studentId, String birthday, boolean onboarded) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.avatar = avatar;
        this.studentId = studentId;
        this.birthday = birthday;
        this.onboarded = onboarded;
    }

    // ================== Getters and Setters ==================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getBirthday() { return birthday; }
    public void setBirthday(String birthday) { this.birthday = birthday; }

    public boolean isOnboarded() { return onboarded; }
    public void setOnboarded(boolean onboarded) { this.onboarded = onboarded; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}