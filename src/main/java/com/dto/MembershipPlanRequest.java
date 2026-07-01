package com.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

/**
 * MembershipPlanRequest DTO - Data sent from the frontend when creating or updating a membership plan.
 * Validates that the plan has a name, a positive price, and a duration.
 */
public class MembershipPlanRequest {

    /** Unique ID for the plan (provided by frontend on create) */
    private String id;

    /** Display name of the plan, e.g. "Basic Monthly" */
    @NotBlank(message = "Plan name is required")
    private String name;

    /** Price in dollars - must be greater than zero */
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than zero")
    private double price;

    /** Billing cycle: "Monthly", "Quarterly", or "Yearly" */
    @NotBlank(message = "Duration is required")
    private String duration;

    /** List of benefits included, e.g. ["Gym Access", "Locker Room"] */
    private List<String> benefits;

    // ===================== Constructors =====================

    /** Default no-argument constructor */
    public MembershipPlanRequest() {
    }

    /** All-arguments constructor */
    public MembershipPlanRequest(String id, String name, double price, String duration, List<String> benefits) {
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


