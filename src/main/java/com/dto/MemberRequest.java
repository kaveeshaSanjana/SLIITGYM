package com.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * MemberRequest DTO - Data sent from the frontend when creating or updating a member.
 * Contains validation rules to ensure required fields are present and correctly formatted.
 */
public class MemberRequest {

    /** Unique ID for the member (provided by frontend on create) */
    private String id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    /** URL to avatar image (optional) */
    private String avatar;

    private String joinedDate;

    /** ID of the membership plan to assign (optional) */
    private String planId;

    /** Must be either "REGULAR" or "PREMIUM" */
    @NotBlank(message = "Membership type is required")
    @Pattern(regexp = "(?i)REGULAR|PREMIUM", message = "Membership type must be REGULAR or PREMIUM")
    private String membershipType;

    /** Must be either "ACTIVE" or "INACTIVE" */
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "(?i)ACTIVE|INACTIVE", message = "Status must be ACTIVE or INACTIVE")
    private String status;

    /** ID of the instructor to assign (optional) */
    private String instructorId;

    /** QR code string for digital ID card (optional) */
    private String qrCode;

    /** Phone number (optional) */
    private String phone;

    /** Home address (optional) */
    private String address;

    /** NFC/RFID card UID for door access (optional) */
    private String cardId;

    // ===================== Constructors =====================

    /** Default no-argument constructor */
    public MemberRequest() {
    }

    /** All-arguments constructor */
    public MemberRequest(String id, String name, String email, String avatar, String joinedDate, String planId, String membershipType, String status, String instructorId, String qrCode, String phone, String address, String cardId) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatar = avatar;
        this.joinedDate = joinedDate;
        this.planId = planId;
        this.membershipType = membershipType;
        this.status = status;
        this.instructorId = instructorId;
        this.qrCode = qrCode;
        this.phone = phone;
        this.address = address;
        this.cardId = cardId;
    }

    // ================== Getters and Setters ==================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }

    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }

    public String getMembershipType() { return membershipType; }
    public void setMembershipType(String membershipType) { this.membershipType = membershipType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getInstructorId() { return instructorId; }
    public void setInstructorId(String instructorId) { this.instructorId = instructorId; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCardId() { return cardId; }
    public void setCardId(String cardId) { this.cardId = cardId; }
}


