package com.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

/**
 * PaymentRequest DTO - Data sent from the frontend when recording or updating a payment.
 * Validates that the amount is positive and status/method are valid enum values.
 */
public class PaymentRequest {

    /** ID of the member making the payment */
    @NotBlank(message = "Member ID is required")
    private String memberId;

    /** Payment amount in dollars - must be greater than zero */
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private double amount;

    /** Date of payment (format: yyyy-MM-dd) */
    @NotBlank(message = "Date is required")
    private String date;

    /** Payment status: must be PAID, PENDING, or OVERDUE */
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "(?i)PAID|PENDING|OVERDUE", message = "Status must be PAID, PENDING, or OVERDUE")
    private String status;

    /** Payment method: must be CASH, CARD, or ONLINE */
    @NotBlank(message = "Payment method is required")
    @Pattern(regexp = "(?i)CASH|CARD|ONLINE", message = "Method must be CASH, CARD, or ONLINE")
    private String method;

    /** Name of the membership plan this payment is for */
    @NotBlank(message = "Plan name is required")
    private String planName;

    private String paymentType; // PHYSICAL or ONLINE

    /** Reference number from the bank slip (for ONLINE payments) */
    private String slipReference;

    /** URL of the uploaded slip image from S3 */
    private String slipImageUrl;

    /** Name or ID of the staff who verified this payment */
    private String verifiedBy;

    /** Date when the payment was verified (format: yyyy-MM-dd) */
    private String verifiedDate;

    /** Additional notes about this payment */
    private String remarks;

    // ===================== Constructors =====================

    /** Default no-argument constructor */
    public PaymentRequest() {
    }

    /** All-arguments constructor */
    public PaymentRequest(String memberId, double amount, String date, String status, String method, String planName, String paymentType, String slipReference, String slipImageUrl, String verifiedBy, String verifiedDate, String remarks) {
        this.memberId = memberId;
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

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

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


