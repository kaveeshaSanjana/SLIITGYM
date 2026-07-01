package com.service;

import com.entity.DoorDevice;
import com.enums.DeviceStatus;
import com.exception.ResourceNotFoundException;
import com.repository.AccessLogRepository;
import com.repository.DoorDeviceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * DoorDeviceService - Business logic layer for DoorDevice operations.
 * Handles CRUD operations for ESP32 door access devices.
 * Supports filtering by device status (ONLINE/OFFLINE).
 */
@Service
public class DoorDeviceService {

    private final DoorDeviceRepository doorDeviceRepository;
    private final AccessLogRepository accessLogRepository;

    public DoorDeviceService(DoorDeviceRepository doorDeviceRepository, AccessLogRepository accessLogRepository) {
        this.doorDeviceRepository = doorDeviceRepository;
        this.accessLogRepository = accessLogRepository;
    }

    /** Get all registered door devices */
    @Transactional(readOnly = true)
    public List<DoorDevice> getAllDevices() {
        return doorDeviceRepository.findAll();
    }

    /** Find a single device by its ID */
    @Transactional(readOnly = true)
    public Optional<DoorDevice> getDeviceById(String id) {
        return doorDeviceRepository.findById(id);
    }

    /** Get all devices with a specific status (ONLINE or OFFLINE) */
    @Transactional(readOnly = true)
    public List<DoorDevice> getDevicesByStatus(DeviceStatus status) {
        return doorDeviceRepository.findByStatus(status);
    }

    /** Save a new device or update an existing device */
    @Transactional
    public DoorDevice saveDevice(DoorDevice device) {
        return doorDeviceRepository.save(device);
    }

    /** Delete a device by ID - removes access logs first to avoid FK constraint */
    @Transactional
    public void deleteDevice(String id) {
        if (!doorDeviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Device not found with id: " + id);
        }
        accessLogRepository.deleteAll(accessLogRepository.findByDeviceId(id));
        doorDeviceRepository.deleteById(id);
    }
}
