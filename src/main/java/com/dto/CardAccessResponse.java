package com.dto;

/**
 * CardAccessResponse DTO - Response returned to an ESP32 door device after a card access attempt.
 * Tells the device whether to unlock the door and provides member info for display.
 */
public class CardAccessResponse {

    // ========================= Fields =========================

    /** Whether the access was granted (true = door opens) */
    private boolean granted;

    /** Name of the member (null if card not recognized) */
    private String memberName;

    /** Unique ID of the member (null if card not recognized) */
    private String memberId;

    /** Reason for denial, e.g. "Membership expired" (null if granted) */
    private String reason;

    // ===================== Constructors =====================

    /** Default no-argument constructor */
    public CardAccessResponse() {
    }

    /** All-arguments constructor for building a complete response */
    public CardAccessResponse(boolean granted, String memberName, String memberId, String reason) {
        this.granted = granted;
        this.memberName = memberName;
        this.memberId = memberId;
        this.reason = reason;
    }

    // ================== Getters and Setters ==================

    public boolean isGranted() { return granted; }
    public void setGranted(boolean granted) { this.granted = granted; }

    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}


