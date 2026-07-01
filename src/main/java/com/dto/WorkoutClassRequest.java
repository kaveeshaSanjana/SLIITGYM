package com.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.ArrayList;
import java.util.List;

/**
 * WorkoutClassRequest DTO - Data sent from the frontend when creating or updating a workout class.
 * Validates that the class has a name, type, trainer, schedule, and a positive capacity.
 */
public class WorkoutClassRequest {

    /** Unique ID for the class (provided by frontend on create) */
    private String id;

    /** Name of the class, e.g. "Morning Yoga" */
    @NotBlank(message = "Class name is required")
    private String name;

    /** Type of workout: "YOGA", "ZUMBA", "CARDIO", or "STRENGTH" */
    @NotBlank(message = "Class type is required")
    private String type;

    /** ID of the instructor who will teach this class */
    @NotBlank(message = "Trainer ID is required")
    private String trainerId;

    /** Schedule text, e.g. "Mon, Wed 08:00 AM" */
    @NotBlank(message = "Schedule is required")
    private String schedule;

    /** Maximum number of members allowed - must be at least 1 */
    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be greater than zero")
    private int capacity;

    /** Current number of enrolled members - cannot be negative */
    @Min(value = 0, message = "Enrolled count cannot be negative")
    private int enrolledCount;

    /** IDs of members enrolled in this class */
    private List<String> enrolledMemberIds = new ArrayList<>();

    // ===================== Constructors =====================

    /** Default no-argument constructor */
    public WorkoutClassRequest() {
    }

    /** All-arguments constructor */
    public WorkoutClassRequest(String id, String name, String type, String trainerId, String schedule, int capacity, int enrolledCount) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.trainerId = trainerId;
        this.schedule = schedule;
        this.capacity = capacity;
        this.enrolledCount = enrolledCount;
    }

    // ================== Getters and Setters ==================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTrainerId() { return trainerId; }
    public void setTrainerId(String trainerId) { this.trainerId = trainerId; }

    public String getSchedule() { return schedule; }
    public void setSchedule(String schedule) { this.schedule = schedule; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public int getEnrolledCount() { return enrolledCount; }
    public void setEnrolledCount(int enrolledCount) { this.enrolledCount = enrolledCount; }

    public List<String> getEnrolledMemberIds() { return enrolledMemberIds; }
    public void setEnrolledMemberIds(List<String> enrolledMemberIds) { this.enrolledMemberIds = enrolledMemberIds; }
}


