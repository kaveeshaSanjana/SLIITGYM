package com.controller;

import com.dto.AttendanceRequest;
import com.entity.Attendance;
import com.entity.User;
import com.exception.ResourceNotFoundException;
import com.service.AttendanceService;
import com.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * AttendanceController - REST API endpoints for Attendance tracking.
 * Handles creating, reading, updating, and deleting attendance records.
 * Supports filtering by user and by date.
 * Base URL: /api/attendance
 */
@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserService userService;

    public AttendanceController(AttendanceService attendanceService, UserService userService) {
        this.attendanceService = attendanceService;
        this.userService = userService;
    }

    /**
     * GET /api/attendance - Get all attendance records
     */
    @GetMapping
    public List<Attendance> getAllAttendance() {

        return attendanceService.getAllAttendance();

    }

    /**
     * GET /api/attendance/{id} - Get a single attendance record by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Attendance> getAttendanceById(@PathVariable String id) {
        return attendanceService.getAttendanceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/attendance/user/{userId} - Get all attendance records for a specific user
     */
    @GetMapping("/user/{userId}")
    public List<Attendance> getAttendanceByUser(@PathVariable String userId) {
        return attendanceService.getAttendanceByUser(userId);
    }

    /**
     * GET /api/attendance/date/{date} - Get all attendance records for a specific date
     */
    @GetMapping("/date/{date}")
    public List<Attendance> getAttendanceByDate(@PathVariable String date) {
        return attendanceService.getAttendanceByDate(date);
    }

    /**
     * POST /api/attendance - Create a new attendance record.
     * Looks up the user, generates a unique ID with "att" prefix, and saves.
     */
    @PostMapping
    public ResponseEntity<Attendance> createAttendance(@Valid @RequestBody AttendanceRequest req) {
        // Look up the user to ensure they exist
        User user = userService.getUserById(req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + req.getUserId()));

        Attendance attendance = new Attendance();
        // Generate a unique attendance ID with "att" prefix
        attendance.setId("att" + UUID.randomUUID().toString().substring(0, 6));
        attendance.setUser(user);
        attendance.setDate(req.getDate());
        attendance.setCheckIn(req.getCheckIn());
        attendance.setCheckOut(req.getCheckOut());
        attendance.setWeight(req.getWeight());

        return ResponseEntity.ok(attendanceService.saveAttendance(attendance));
    }

    /**
     * PUT /api/attendance/{id} - Update an existing attendance record.
     * Only checkIn, checkOut, and weight can be updated.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Attendance> updateAttendance(@PathVariable String id, @Valid @RequestBody AttendanceRequest req) {
        return attendanceService.getAttendanceById(id).map(attendance -> {
            attendance.setCheckIn(req.getCheckIn());
            attendance.setCheckOut(req.getCheckOut());
            attendance.setWeight(req.getWeight());
            return ResponseEntity.ok(attendanceService.saveAttendance(attendance));

        }).orElse(ResponseEntity.notFound().build());
    }


    /**
     * DELETE /api/attendance/{id} - Delete an attendance record
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable String id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }
}

