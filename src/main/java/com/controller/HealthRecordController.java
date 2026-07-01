package com.controller;

import com.dto.HealthRecordRequest;
import com.entity.HealthRecord;
import com.entity.Member;
import com.exception.ResourceNotFoundException;
import com.service.HealthRecordService;
import com.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * HealthRecordController - REST API endpoints for Health Record operations.
 * Handles creating, reading, updating, and deleting member health records.
 * Supports filtering records by member.
 * Base URL: /api/health-records
 */
@RestController
@RequestMapping("/api/health-records")
@CrossOrigin(origins = "*")

public class HealthRecordController {

    private final HealthRecordService healthRecordService;
    private final MemberService memberService;

    public HealthRecordController(HealthRecordService healthRecordService, MemberService memberService) {
        this.healthRecordService = healthRecordService;
        this.memberService = memberService;
    }

    @GetMapping
    public List<HealthRecord> getAllHealthRecords() {
        return healthRecordService.getAllHealthRecords();
    }

    /** GET /api/health-records/{id} - Get a single health record by ID */
    @GetMapping("/{id}")
    public ResponseEntity<HealthRecord> getHealthRecordById(@PathVariable String id) {
        return healthRecordService.getHealthRecordById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/health-records/member/{memberId} - Get all health records for a specific member */
    @GetMapping("/member/{memberId}")
    public List<HealthRecord> getHealthRecordsByMember(@PathVariable String memberId) {
        return healthRecordService.getHealthRecordsByMember(memberId);
    }


    /**
     * POST /api/health-records - Create a new health record.
     * Looks up the member, generates a unique ID with "h" prefix, and saves.
     */
    @PostMapping
    public ResponseEntity<HealthRecord> createHealthRecord(@Valid @RequestBody HealthRecordRequest req) {
        // Look up the member to ensure they exist
        Member member = memberService.getMemberById(req.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + req.getMemberId()));

        HealthRecord record = new HealthRecord();
        // Generate a unique health record ID with "h" prefix
        record.setId("h" + UUID.randomUUID().toString().substring(0, 6));
        record.setMember(member);
        record.setDate(req.getDate());
        record.setHeight(req.getHeight());
        record.setWeight(req.getWeight());
        record.setWorkingTime(req.getWorkingTime());
        record.setCaloriesBurned(req.getCaloriesBurned());

        return ResponseEntity.ok(healthRecordService.saveHealthRecord(record));
    }


    /**
     * PUT /api/health-records/{id} - Update an existing health record.
     * Updates date, height, weight, working time, and calories burned.
     */
    @PutMapping("/{id}")
    public ResponseEntity<HealthRecord> updateHealthRecord(@PathVariable String id, @Valid @RequestBody HealthRecordRequest req) {
        return healthRecordService.getHealthRecordById(id).map(record -> {
            record.setDate(req.getDate());
            record.setHeight(req.getHeight());
            record.setWeight(req.getWeight());
            record.setWorkingTime(req.getWorkingTime());
            record.setCaloriesBurned(req.getCaloriesBurned());
            return ResponseEntity.ok(healthRecordService.saveHealthRecord(record));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/health-records/{id} - Delete a health record */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHealthRecord(@PathVariable String id) {
        healthRecordService.deleteHealthRecord(id);
        return ResponseEntity.noContent().build();
    }
}





