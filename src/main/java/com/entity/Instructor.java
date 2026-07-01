package com.entity;

import jakarta.persistence.*;

/**
 * Instructor entity - Represents a gym trainer/instructor.
 * Extends User (inherits id, name, email, role, avatar).
 * Instructors have a specialization area and are assigned to members.
 */
@Entity
@Table(name = "instructors")
@DiscriminatorValue("INSTRUCTOR")
public class Instructor extends User {

    /** Area of expertise, e.g. "Bodybuilding", "Yoga & Pilates" */
    private String specialization;

    /** Years of experience as a trainer, e.g. "8 years" */
    private String experience;

    /** Number of members currently assigned to this instructor */
    private int membersCount;

    /** Working hours schedule, e.g. "08:00 AM - 04:00 PM" */
    private String workingHours;

    // ===================== Constructors =====================

    /** Default no-argument constructor (required by JPA) */
    public Instructor() {
    }

    /** All-arguments constructor for creating a complete Instructor */
    public Instructor(String specialization, String experience, int membersCount, String workingHours) {
        this.specialization = specialization;
        this.experience = experience;
        this.membersCount = membersCount;
        this.workingHours = workingHours;
    }

    // ================== Getters and Setters ==================

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public int getMembersCount() { return membersCount; }
    public void setMembersCount(int membersCount) { this.membersCount = membersCount; }

    public String getWorkingHours() { return workingHours; }
    public void setWorkingHours(String workingHours) { this.workingHours = workingHours; }
}


