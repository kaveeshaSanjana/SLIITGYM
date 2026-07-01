package com.service;

import com.entity.Attendance;
import com.exception.BusinessValidationException;
import com.exception.ResourceNotFoundException;
import com.repository.AttendanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * AttendanceService - Business logic layer for Attendance operations.
 * Handles CRUD operations for gym attendance records with time and weight validation.
 */
@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }
    
    /** Get all attendance records */
    @Transactional(readOnly = true)
    public List<Attendance> getAllAttendance() {

        return attendanceRepository.findAll();

    }
    
    /** Find a single attendance record by its ID */
    @Transactional(readOnly = true)
    public Optional<Attendance> getAttendanceById(String id) {

        return attendanceRepository.findById(id);

    }

    /** Get all attendance records for a specific user */
    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByUser(String userId) {
        return attendanceRepository.findByUserId(userId);
    }

    /** Get all attendance records for a specific date */
    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByDate(String date) {
        return attendanceRepository.findByDate(date);
    }
    /**
     * Save a new attendance record or update an existing one.
     * Validates that check-out is after check-in and weight is positive.
     */
    @Transactional
    public Attendance saveAttendance(Attendance attendance) {
        // If both check-in and check-out times are provided, check-out must be later
        if (attendance.getCheckIn() != null && attendance.getCheckOut() != null) {
            if (attendance.getCheckOut().compareTo(attendance.getCheckIn()) <= 0) {
                throw new BusinessValidationException("Check-out time must be after check-in time");
            }
        }
        // Weight must be positive if provided
        if (attendance.getWeight() != null && attendance.getWeight() <= 0) {
            throw new BusinessValidationException("Weight must be a positive value");
        }
        return attendanceRepository.save(attendance);
    }
    /** Delete an attendance record by ID - throws exception if not found */
    @Transactional
    public void deleteAttendance(String id) {
        if (!attendanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Attendance record not found with id: " + id);
        }
        attendanceRepository.deleteById(id);
    }
}

