package com.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

/**
 * Attendance entity - Tracks daily gym attendance for users.
 * Records check-in/check-out times and optional weight measurement.
 */
@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    private String id;

    /** The user (member, instructor, or admin) who attended */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    /** Date of attendance (format: yyyy-MM-dd) */
    @Column(nullable = false)
    private String date;

    /** Check-in time (format: HH:mm) */
    @Column(nullable = false)
    private String checkIn;

    /** Check-out time (format: HH:mm) - null if not checked out yet */
    private String checkOut;

    /** Optional weight measurement in kilograms taken at check-in */
    private Double weight;

    // ===================== Constructors =====================

    /** Default no-argument constructor (required by JPA) */
    public Attendance() {
    }

    /** All-arguments constructor for creating a complete Attendance record */
    public Attendance(String id, User user, String date, String checkIn, String checkOut, Double weight) {
        this.id = id;
        this.user = user;
        this.date = date;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.weight = weight;
    }

    // ================== Getters and Setters ==================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getCheckIn() { return checkIn; }
    public void setCheckIn(String checkIn) { this.checkIn = checkIn; }

    public String getCheckOut() { return checkOut; }
    public void setCheckOut(String checkOut) { this.checkOut = checkOut; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
}


