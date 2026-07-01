package com.entity;

import jakarta.persistence.*;

import java.util.List;

/**
 * MembershipPlan entity - Represents a gym membership plan.
 * Each plan has a name, price, duration, and a list of benefits.
 * Members subscribe to one plan at a time.
 */
@Entity
@Table(name = "membership_plans")
public class MembershipPlan {

    @Id
    private String id;

    /** Display name of the plan, e.g. "Basic Monthly", "Elite Yearly" */
    @Column(nullable = false)
    private String name;

    /** Cost of the plan in dollars */
    @Column(nullable = false)
    private double price;

    /** Billing cycle: "Monthly", "Quarterly", or "Yearly" */
    @Column(nullable = false)
    private String duration;

    /**
     * List of benefits included in this plan.
     * Stored in a separate table (plan_benefits) linked by plan_id.
     * Example: ["Gym Access", "Locker Room", "Personal Trainer"]
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "plan_benefits", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "benefit")
    private List<String> benefits;

    // ===================== Constructors =====================

    /** Default no-argument constructor (required by JPA) */
    public MembershipPlan() {
    }

    /** All-arguments constructor for creating a complete MembershipPlan */
    public MembershipPlan(String id, String name, double price, String duration, List<String> benefits) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.duration = duration;
        this.benefits = benefits;
    }

    // ================== Getters and Setters ==================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public List<String> getBenefits() { return benefits; }
    public void setBenefits(List<String> benefits) { this.benefits = benefits; }
}


