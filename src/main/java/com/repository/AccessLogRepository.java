package com.repository;

import com.entity.AccessLog;
import com.enums.AccessResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * AccessLogRepository - Database access layer for AccessLog entity.
 * Provides custom queries to filter access logs by device, member, date,
 * and to count granted access events for a device on a given date.
 */
@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, String> {

    /** Find all access logs for a specific device */
    List<AccessLog> findByDeviceId(String deviceId);

    /** Find all access logs for a specific member */
    List<AccessLog> findByMemberId(String memberId);

    /** Find all access logs for a specific date */
    List<AccessLog> findByDate(String date);

    /** Find all access logs for a specific device on a specific date */
    List<AccessLog> findByDeviceIdAndDate(String deviceId, String date);

    /** Count access logs for a device on a given date with a specific result */
    long countByDeviceIdAndDateAndResult(String deviceId, String date, AccessResult result);
}