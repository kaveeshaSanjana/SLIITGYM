package com.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * HealthRecordRequest DTO - Data sent from the frontend when adding or updating health records.
 * All measurements have validation ranges to ensure realistic values.
 */
public class HealthRecordRequest {

    /** ID of the member this health record belongs to */
    @NotBlank(message = "Member ID is required")
    private String memberId;

    /** Date of the health record (format: yyyy-MM-dd) */
    @NotBlank(message = "Date is required")
    private String date;

    /** Height in centimeters (must be between 50 and 300) */
    @Positive(message = "Height must be positive")
    @Min(value = 50, message = "Height must be at least 50 cm")
    @Max(value = 300, message = "Height cannot exceed 300 cm")
    private double height;

    /** Weight in kilograms (must be between 20 and 500) */
    @Positive(message = "Weight must be positive")
    @Min(value = 20, message = "Weight must be at least 20 kg")
    @Max(value = 500, message = "Weight cannot exceed 500 kg")
    private double weight;

    /** Workout duration in minutes (must be between 0 and 1440 = 24 hours) */
    @Min(value = 0, message = "Working time cannot be negative")
    @Max(value = 1440, message = "Working time cannot exceed 24 hours (1440 min)")
    private int workingTime;

    /** Calories burned during the workout (must be between 0 and 10000) */
    @Min(value = 0, message = "Calories burned cannot be negative")
    @Max(value = 10000, message = "Calories burned seems unrealistic")
    private int caloriesBurned;

    // ===================== Constructors =====================

    /** Default no-argument constructor */
    public HealthRecordRequest() {
    }

    /** All-arguments constructor */
    public HealthRecordRequest(String memberId, String date, double height, double weight, int workingTime, int caloriesBurned) {
        this.memberId = memberId;
        this.date = date;
        this.height = height;
        this.weight = weight;
        this.workingTime = workingTime;
        this.caloriesBurned = caloriesBurned;
    }

    // ================== Getters and Setters ==================

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public double getHeight() { return height; }
    public void setHeight(double height) { this.height = height; }

    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }

    public int getWorkingTime() { return workingTime; }
    public void setWorkingTime(int workingTime) { this.workingTime = workingTime; }

    public int getCaloriesBurned() { return caloriesBurned; }
    public void setCaloriesBurned(int caloriesBurned) { this.caloriesBurned = caloriesBurned; }
}


