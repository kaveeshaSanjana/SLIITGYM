package com.entity;

import com.enums.AccessResult;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

/**
 * AccessLog entity - Records each door access attempt by a member.
 * Logs which device was used, which member attempted access,
 * the result (GRANTED or DENIED), and the reason if denied.
 */
@Entity
@Table(name = "access_logs")
public class AccessLog {

    // ========================= Fields =========================

    /** Unique identifier for this access log entry */
    @Id
    private String id;

    /** The door device where the access attempt occurred */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "device_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private DoorDevice device;

    /** The member who attempted access (null if card not recognized) */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Member member;

    /** NFC/RFID card UID used for the access attempt */
    private String cardId;

    /** Exact time of the access attempt (format: HH:mm:ss) */
    @Column(nullable = false)
    private String timestamp;

    /** Date of the access attempt (format: yyyy-MM-dd) */
    @Column(nullable = false)
    private String date;

    /** Result of the access attempt: GRANTED or DENIED */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessResult result;

    /** Reason for denial (null if access was granted) */
    private String reason;

    // ===================== Constructors =====================

    /** Default no-argument constructor (required by JPA) */
    public AccessLog() {
    }

    /** All-arguments constructor for creating a complete AccessLog */
    public AccessLog(String id, DoorDevice device, Member member, String cardId,
                     String timestamp, String date, AccessResult result, String reason) {
        this.id = id;
        this.device = device;
        this.member = member;
        this.cardId = cardId;
        this.timestamp = timestamp;
        this.date = date;
        this.result = result;
        this.reason = reason;
    }

    // ================== Getters and Setters ==================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public DoorDevice getDevice() { return device; }
    public void setDevice(DoorDevice device) { this.device = device; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }

    public String getCardId() { return cardId; }
    public void setCardId(String cardId) { this.cardId = cardId; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public AccessResult getResult() { return result; }
    public void setResult(AccessResult result) { this.result = result; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}


