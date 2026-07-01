package com.dto;

import jakarta.validation.constraints.NotBlank;

public class DeviceActivityRequest {

    @NotBlank(message = "Equipment ID is required")
    private String equipmentId;

    @NotBlank(message = "Card ID is required")
    private String cardId;

    @NotBlank(message = "Time is required")
    private String time;

    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }

    public String getCardId() { return cardId; }
    public void setCardId(String cardId) { this.cardId = cardId; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
}
