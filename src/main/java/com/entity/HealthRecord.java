package com.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

/**
 * HealthRecord entity - Stores daily health and workout data for a member.
 * Tracks height, weight, workout duration, and calories burned per day.
 */
@Entity
@Table(name = "health_records")
public class HealthRecord {

    @Id
    private String id;

    /** The member this health record belongs to */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Member member;

    /** Date of the health record (format: yyyy-MM-dd) */
    @Column(nullable = false)
    private String date;

    /** Height in centimeters (valid range: 50-300) */
    private double height;

    /** Weight in kilograms (valid range: 20-500) */
    private double weight;

    /** Workout duration in minutes (valid range: 0-1440) */
    private int workingTime;

    /** Total calories burned during the workout (valid range: 0-10000) */
    private int caloriesBurned;

    // ===================== Constructors =====================

    /** Default no-argument constructor (required by JPA) */
    public HealthRecord() {
    }

    /** All-arguments constructor for creating a complete HealthRecord */
    public HealthRecord(String id, Member member, String date, double height,
                        double weight, int workingTime, int caloriesBurned) {
        this.id = id;
        this.member = member;
        this.date = date;
        this.height = height;
        this.weight = weight;
        this.workingTime = workingTime;
        this.caloriesBurned = caloriesBurned;
    }

    // ================== Getters and Setters ==================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }

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


