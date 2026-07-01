package com.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

/**
 * AttendanceRequest DTO - Data sent from the frontend when marking or updating attendance.
 * Requires user ID and date; check-in/check-out times and weight are optional.
 */
public class AttendanceRequest {

    /** ID of the user whose attendance is being recorded */
    @NotBlank(message = "User ID is required")
    private String userId;

    /** Date of attendance (format: yyyy-MM-dd) */
    @NotBlank(message = "Date is required")
    private String date;

    /** Check-in time (format: HH:mm) - optional */
    private String checkIn;

    /** Check-out time (format: HH:mm) - optional */
    private String checkOut;

    /** Weight measurement in kg taken at check-in (optional, must be positive) */
    @Positive(message = "Weight must be a positive value")
    private Double weight;

    // ===================== Constructors =====================

    /** Default no-argument constructor */
    public AttendanceRequest() {
    }

    /** All-arguments constructor */
    public AttendanceRequest(String userId, String date, String checkIn, String checkOut, Double weight) {
        this.userId = userId;
        this.date = date;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.weight = weight;
    }

    // ================== Getters and Setters ==================

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getCheckIn() { return checkIn; }
    public void setCheckIn(String checkIn) { this.checkIn = checkIn; }

    public String getCheckOut() { return checkOut; }
    public void setCheckOut(String checkOut) { this.checkOut = checkOut; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
}


