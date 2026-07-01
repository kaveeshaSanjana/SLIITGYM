package com.entity;

import com.enums.PaymentMethod;
import com.enums.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

/**
 * Payment entity - Represents a payment made by a gym member.
 * Tracks the amount, date, payment status, payment method, and the plan it's for.
 */
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    private String id;

    /** The member who made this payment */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Member member;

    /** Payment amount in dollars */
    @Column(nullable = false)
    private double amount;

    /** Date the payment was made (format: yyyy-MM-dd) */
    @Column(nullable = false)
    private String date;

    /** Payment status: PAID, PENDING, or OVERDUE */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    /** How the payment was made: CASH, CARD, or ONLINE */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    /** Name of the membership plan this payment is for */
    @Column(nullable = false)
    private String planName;

    /** Payment type: PHYSICAL (in-person) or ONLINE (bank transfer) */
    private String paymentType;

    /** Bank slip image URL or reference number for online payments */
    private String slipReference;

    /** Public S3 URL of the uploaded slip image */
    private String slipImageUrl;

    /** Name or ID of the admin who verified this payment */
    private String verifiedBy;

    /** Date when the payment was verified (format: yyyy-MM-dd) */
    private String verifiedDate;

    /** Additional notes or comments about this payment */
    private String remarks;

    // ===================== Constructors =====================

    /** Default no-argument constructor (required by JPA) */
    public Payment() {
    }

    /** All-arguments constructor for creating a complete Payment */
    public Payment(String id, Member member, double amount, String date,
                   PaymentStatus status, PaymentMethod method, String planName,
                   String paymentType, String slipReference, String slipImageUrl,
                   String verifiedBy, String verifiedDate, String remarks) {
        this.id = id;
        this.member = member;
        this.amount = amount;
        this.date = date;
        this.status = status;
        this.method = method;
        this.planName = planName;
        this.paymentType = paymentType;
        this.slipReference = slipReference;
        this.slipImageUrl = slipImageUrl;
        this.verifiedBy = verifiedBy;
        this.verifiedDate = verifiedDate;
        this.remarks = remarks;
    }

    // ================== Getters and Setters ==================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public PaymentMethod getMethod() { return method; }
    public void setMethod(PaymentMethod method) { this.method = method; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }

    public String getSlipReference() { return slipReference; }
    public void setSlipReference(String slipReference) { this.slipReference = slipReference; }

    public String getSlipImageUrl() { return slipImageUrl; }
    public void setSlipImageUrl(String slipImageUrl) { this.slipImageUrl = slipImageUrl; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public String getVerifiedDate() { return verifiedDate; }
    public void setVerifiedDate(String verifiedDate) { this.verifiedDate = verifiedDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}


