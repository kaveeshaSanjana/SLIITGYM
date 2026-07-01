package com.service;

import com.entity.AccessLog;
import com.enums.AccessResult;
import com.repository.AccessLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * AccessLogService - Business logic layer for AccessLog operations.
 * Handles querying and saving door access log entries.
 * Supports filtering by device, member, and date.
 */
@Service
public class AccessLogService {

    private final AccessLogRepository accessLogRepository;

    public AccessLogService(AccessLogRepository accessLogRepository) {
        this.accessLogRepository = accessLogRepository;
    }

    /** Get all access log entries */
    @Transactional(readOnly = true)
    public List<AccessLog> getAllAccessLogs() {
        return accessLogRepository.findAll();
    }

    /** Find a single access log entry by its ID */
    @Transactional(readOnly = true)
    public Optional<AccessLog> getAccessLogById(String id) {
        return accessLogRepository.findById(id);
    }

    /** Get all access logs for a specific door device */
    @Transactional(readOnly = true)
    public List<AccessLog> getAccessLogsByDevice(String deviceId) {
        return accessLogRepository.findByDeviceId(deviceId);
    }

    /** Get all access logs for a specific member */
    @Transactional(readOnly = true)
    public List<AccessLog> getAccessLogsByMember(String memberId) {
        return accessLogRepository.findByMemberId(memberId);
    }

    /** Get all access logs for a specific date */
    @Transactional(readOnly = true)
    public List<AccessLog> getAccessLogsByDate(String date) {
        return accessLogRepository.findByDate(date);
    }

    /** Get all access logs for a specific device on a specific date */
    @Transactional(readOnly = true)
    public List<AccessLog> getAccessLogsByDeviceAndDate(String deviceId, String date) {
        return accessLogRepository.findByDeviceIdAndDate(deviceId, date);
    }

    /** Count how many GRANTED access events occurred for a device on a given date */
    @Transactional(readOnly = true)
    public long countGrantedAccessToday(String deviceId, String date) {
        return accessLogRepository.countByDeviceIdAndDateAndResult(deviceId, date, AccessResult.GRANTED);
    }

    /** Save a new access log entry */
    @Transactional
    public AccessLog saveAccessLog(AccessLog accessLog) {
        return accessLogRepository.save(accessLog);
    }
}