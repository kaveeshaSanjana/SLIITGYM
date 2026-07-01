package com.entity;

import com.enums.ClassType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * WorkoutClass entity - Represents a scheduled gym class.
 * Each class has a type (Yoga, Zumba, etc.), an assigned trainer,
 * a schedule, and tracks enrollment vs capacity.
 */
@Entity
@Table(name = "workout_classes")
public class WorkoutClass {

    @Id
    private String id;

    /** Name of the class, e.g. "Morning Yoga", "Power Strength" */
    @Column(nullable = false)
    private String name;

    /** Type of workout: YOGA, ZUMBA, CARDIO, or STRENGTH */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClassType type;

    /** The instructor who teaches this class */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trainer_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Instructor trainer;

    /** Schedule description, e.g. "Mon, Wed 08:00 AM" */
    @Column(nullable = false)
    private String schedule;

    /** Maximum number of members allowed in this class */
    private int capacity;

    /** Current number of members enrolled in this class */
    private int enrolledCount;

    /** IDs of members enrolled in this class */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "class_enrolled_members", joinColumns = @JoinColumn(name = "class_id"))
    @Column(name = "member_id")
    private List<String> enrolledMemberIds = new ArrayList<>();

    // ===================== Constructors =====================

    /** Default no-argument constructor (required by JPA) */
    public WorkoutClass() {
    }

    /** All-arguments constructor for creating a complete WorkoutClass */
    public WorkoutClass(String id, String name, ClassType type, Instructor trainer,
                        String schedule, int capacity, int enrolledCount) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.trainer = trainer;
        this.schedule = schedule;
        this.capacity = capacity;
        this.enrolledCount = enrolledCount;
    }

    // ================== Getters and Setters ==================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public ClassType getType() { return type; }
    public void setType(ClassType type) { this.type = type; }

    public Instructor getTrainer() { return trainer; }
    public void setTrainer(Instructor trainer) { this.trainer = trainer; }

    public String getSchedule() { return schedule; }
    public void setSchedule(String schedule) { this.schedule = schedule; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public int getEnrolledCount() { return enrolledCount; }
    public void setEnrolledCount(int enrolledCount) { this.enrolledCount = enrolledCount; }

    public List<String> getEnrolledMemberIds() { return enrolledMemberIds; }
    public void setEnrolledMemberIds(List<String> enrolledMemberIds) { this.enrolledMemberIds = enrolledMemberIds; }
}


