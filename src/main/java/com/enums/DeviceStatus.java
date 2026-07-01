package com.enums;

/**
 * DeviceStatus enum - Current operational status of an ESP32 door device.
 * ONLINE = device is actively sending heartbeats, OFFLINE = no recent heartbeat.
 */
public enum DeviceStatus {
    ONLINE,
    OFFLINE
}


