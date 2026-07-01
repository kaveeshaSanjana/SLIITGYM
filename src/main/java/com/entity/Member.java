package com.entity;

import com.enums.MemberStatus;
import com.enums.MembershipType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

/**
 * Member entity - Represents a gym member.
 * Extends User (inherits id, name, email, role, avatar).
 * Each member has a membership plan, an assigned instructor, and a status.
 */
@Entity
@Table(name = "members")
@DiscriminatorValue("MEMBER")
public class Member extends User {

    /** Date the member joined the gym (format: yyyy-MM-dd) */
    private String joinedDate;

    /** The membership plan this member is subscribed to */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plan_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private MembershipPlan plan;

    /** Type of membership: REGULAR or PREMIUM */
    @Enumerated(EnumType.STRING)
    private MembershipType membershipType;

    /** Current status of the member: ACTIVE or INACTIVE */
    @Enumerated(EnumType.STRING)
    private MemberStatus status;

    /** The instructor assigned to this member */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instructor_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Instructor instructor;

    /** QR code string used for the member's digital ID card */
    private String qrCode;

    /** Contact phone number */
    private String phone;

    /** Home or mailing address */
    private String address;

    /** NFC/RFID card UID for door access via ESP32 devices */
    private String cardId;

    // ===================== Constructors =====================

    /** Default no-argument constructor (required by JPA) */
    public Member() {
    }

    /** All-arguments constructor for creating a complete Member */
    public Member(String joinedDate, MembershipPlan plan, MembershipType membershipType,
                  MemberStatus status, Instructor instructor, String qrCode,
                  String phone, String address, String cardId) {
        this.joinedDate = joinedDate;
        this.plan = plan;
        this.membershipType = membershipType;
        this.status = status;
        this.instructor = instructor;
        this.qrCode = qrCode;
        this.phone = phone;
        this.address = address;
        this.cardId = cardId;
    }

    // ================== Getters and Setters ==================

    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }

    public MembershipPlan getPlan() { return plan; }
    public void setPlan(MembershipPlan plan) { this.plan = plan; }

    public MembershipType getMembershipType() { return membershipType; }
    public void setMembershipType(MembershipType membershipType) { this.membershipType = membershipType; }

    public MemberStatus getStatus() { return status; }
    public void setStatus(MemberStatus status) { this.status = status; }

    public Instructor getInstructor() { return instructor; }
    public void setInstructor(Instructor instructor) { this.instructor = instructor; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCardId() { return cardId; }
    public void setCardId(String cardId) { this.cardId = cardId; }
}


