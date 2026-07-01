package com.repository;

import com.entity.DoorDevice;
import com.enums.DeviceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * DoorDeviceRepository - Database access layer for DoorDevice entity.
 * Provides custom queries to filter devices by their operational status.
 */
@Repository
public interface DoorDeviceRepository extends JpaRepository<DoorDevice, String> {

    /** Find all devices with a specific status (ONLINE or OFFLINE) */
    List<DoorDevice> findByStatus(DeviceStatus status);
}
