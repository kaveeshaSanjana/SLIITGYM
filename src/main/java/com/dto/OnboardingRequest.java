package com.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * OnboardingRequest DTO - Data sent from the frontend when a new user completes onboarding.
 * Captures the user's name and optional birthday to complete their profile setup.
 */
public class OnboardingRequest {

    // ========================= Fields =========================

    /** Full name of the user */
    @NotBlank(message = "Name is required")
    private String name;

    /** Date of birth (format: yyyy-MM-dd, optional) */
    private String birthday;

    // ===================== Constructors =====================

    /** Default no-argument constructor */
    public OnboardingRequest() {
    }

    /** All-arguments constructor */
    public OnboardingRequest(String name, String birthday) {
        this.name = name;
        this.birthday = birthday;
    }

    // ================== Getters and Setters ==================

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBirthday() { return birthday; }
    public void setBirthday(String birthday) { this.birthday = birthday; }
}


