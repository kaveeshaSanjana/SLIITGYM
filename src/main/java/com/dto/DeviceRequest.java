package com.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DeviceRequest DTO - Data sent from the frontend when registering or updating a door device.
 * Requires a display name and the physical location of the device.
 */
public class DeviceRequest {

    // ========================= Fields =========================

    /** Display name of the device, e.g. "Main Entrance Reader" */
    @NotBlank(message = "Device name is required")
    private String name;

    /** Physical location of the device, e.g. "Front Door" */
    @NotBlank(message = "Location is required")
    private String location;

    // ===================== Constructors =====================

    /** Default no-argument constructor */
    public DeviceRequest() {
    }

    /** All-arguments constructor */
    public DeviceRequest(String name, String location) {
        this.name = name;
        this.location = location;
    }

    // ================== Getters and Setters ==================

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}


