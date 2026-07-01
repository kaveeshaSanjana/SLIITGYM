package com.repository;

import com.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * AttendanceRepository - Database access layer for Attendance entity.
 * Provides custom queries to filter attendance records by user and date.
 */
@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {

    /** Find all attendance records for a specific user */
    List<Attendance> findByUserId(String userId);

    /** Find all attendance records for a specific date */
    List<Attendance> findByDate(String date);
}

