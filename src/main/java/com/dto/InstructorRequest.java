package com.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * InstructorRequest DTO - Data sent from the frontend when creating or updating an instructor.
 * Contains validation rules to ensure required fields like name, email, and specialization are present.
 */
public class InstructorRequest {

    /** Unique ID for the instructor (provided by frontend on create) */
    private String id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    /** URL to avatar image (optional) */
    private String avatar;

    /** Area of expertise, e.g. "Bodybuilding", "Yoga" */
    @NotBlank(message = "Specialization is required")
    private String specialization;

    /** Years of experience, e.g. "5 years" */
    @NotBlank(message = "Experience is required")
    private String experience;

    /** Number of members assigned (optional, defaults to 0) */
    private int membersCount;

    /** Working hours schedule (optional), e.g. "08:00 AM - 04:00 PM" */
    private String workingHours;

    // ===================== Constructors =====================

    /** Default no-argument constructor */
    public InstructorRequest() {
    }

    /** All-arguments constructor */
    public InstructorRequest(String id, String name, String email, String avatar, String specialization, String experience, int membersCount, String workingHours) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatar = avatar;
        this.specialization = specialization;
        this.experience = experience;
        this.membersCount = membersCount;
        this.workingHours = workingHours;
    }

    // ================== Getters and Setters ==================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public int getMembersCount() { return membersCount; }
    public void setMembersCount(int membersCount) { this.membersCount = membersCount; }

    public String getWorkingHours() { return workingHours; }
    public void setWorkingHours(String workingHours) { this.workingHours = workingHours; }
}


