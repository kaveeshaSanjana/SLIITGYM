package com.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * CardAccessRequest DTO - Data sent from an ESP32 door device when a member taps their NFC card.
 * Contains only the card UID which is used to look up the member and determine access.
 */
public class CardAccessRequest {

    // ========================= Fields =========================

    /** NFC/RFID card UID scanned at the door device */
    @NotBlank(message = "Card ID is required")
    private String cardId;

    // ===================== Constructors =====================

    /** Default no-argument constructor */
    public CardAccessRequest() {
    }

    /** Constructor with card ID */
    public CardAccessRequest(String cardId) {
        this.cardId = cardId;
    }

    // ================== Getters and Setters ==================

    public String getCardId() { return cardId; }
    public void setCardId(String cardId) { this.cardId = cardId; }
}


