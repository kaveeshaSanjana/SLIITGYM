package com.entity;

import com.enums.DeviceStatus;
import jakarta.persistence.*;

/**
 * DoorDevice entity - Represents a physical ESP32-based door access device.
 * Each device is installed at a gym entry point and communicates via NFC/RFID.
 * Tracks status (ONLINE/OFFLINE), heartbeat, and daily access counts.
 */
@Entity
@Table(name = "door_devices")
public class DoorDevice {

    // ========================= Fields =========================

    /** Unique identifier for this device */
    @Id
    private String id;

    /** Display name of the device, e.g. "Main Entrance Reader" */
    @Column(nullable = false)
    private String name;

    /** Physical location of the device, e.g. "Front Door", "Gym Floor" */
    @Column(nullable = false)
    private String location;

    /** Current status of the device: ONLINE or OFFLINE */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceStatus status;

    /** Timestamp of the last heartbeat signal received from the device */
    private String lastHeartbeat;

    /** Number of access attempts processed by this device today */
    private int totalAccessToday;

    // ===================== Constructors =====================

    /** Default no-argument constructor (required by JPA) */
    public DoorDevice() {
    }

    /** All-arguments constructor for creating a complete DoorDevice */
    public DoorDevice(String id, String name, String location, DeviceStatus status,
                      String lastHeartbeat, int totalAccessToday) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.status = status;
        this.lastHeartbeat = lastHeartbeat;
        this.totalAccessToday = totalAccessToday;
    }

    // ================== Getters and Setters ==================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public DeviceStatus getStatus() { return status; }
    public void setStatus(DeviceStatus status) { this.status = status; }

    public String getLastHeartbeat() { return lastHeartbeat; }
    public void setLastHeartbeat(String lastHeartbeat) { this.lastHeartbeat = lastHeartbeat; }

    public int getTotalAccessToday() { return totalAccessToday; }
    public void setTotalAccessToday(int totalAccessToday) { this.totalAccessToday = totalAccessToday; }
}


