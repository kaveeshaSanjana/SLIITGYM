package com.controller;

import com.dto.InstructorRequest;
import com.entity.Instructor;
import com.enums.Role;
import com.service.InstructorService;
import com.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * InstructorController - REST API endpoints for Instructor operations.
 * Handles creating, reading, updating, and deleting gym instructors/trainers.
 * Base URL: /api/instructors
 */

@RestController
@RequestMapping("/api/instructors")
@CrossOrigin(origins = "*")
public class InstructorController {

    private final InstructorService instructorService;
    private final EmailService emailService;

    public InstructorController(InstructorService instructorService, EmailService emailService) {
        this.instructorService = instructorService;
        this.emailService = emailService;
    }

    /**
     * GET /api/instructors - Get all instructors
     */
    @GetMapping
    public List<Instructor> getAllInstructors() {
        return instructorService.getAllInstructors();
    }

    /** GET /api/instructors/{id} - Get a single instructor by ID */
    @GetMapping("/{id}")
    public ResponseEntity<Instructor> getInstructorById(@PathVariable String id) {
        return instructorService.getInstructorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/instructors - Create a new instructor.
     * Builds an Instructor entity from the request DTO, saves to database,
     * and sends a welcome email to the new instructor.
     * Role is automatically set to INSTRUCTOR.
     */
    @PostMapping
    public ResponseEntity<Instructor> createInstructor(@Valid @RequestBody InstructorRequest req) {
        Instructor instructor = new Instructor();
        instructor.setId(req.getId());
        instructor.setName(req.getName());
        instructor.setEmail(req.getEmail());
        instructor.setRole(Role.INSTRUCTOR);
        instructor.setAvatar(req.getAvatar());
        instructor.setSpecialization(req.getSpecialization());
        instructor.setExperience(req.getExperience());
        instructor.setMembersCount(req.getMembersCount());
        instructor.setWorkingHours(req.getWorkingHours());

        instructor.setOnboarded(true);
        Instructor savedInstructor = instructorService.saveInstructor(instructor);

        // Send welcome email to the new instructor (async - does not block response)
        emailService.sendInstructorWelcomeEmail(savedInstructor);

        return ResponseEntity.ok(savedInstructor);
    }

    /**
     * PUT /api/instructors/{id} - Update an existing instructor.
     * Finds the instructor by ID, updates fields, and saves.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Instructor> updateInstructor(@PathVariable String id, @Valid @RequestBody InstructorRequest req) {
        return instructorService.getInstructorById(id).map(instructor -> {
            instructor.setName(req.getName());
            instructor.setEmail(req.getEmail());
            instructor.setAvatar(req.getAvatar());
            instructor.setSpecialization(req.getSpecialization());
            instructor.setExperience(req.getExperience());
            instructor.setMembersCount(req.getMembersCount());
            instructor.setWorkingHours(req.getWorkingHours());
            return ResponseEntity.ok(instructorService.saveInstructor(instructor));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/instructors/{id} - Delete an instructor */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstructor(@PathVariable String id) {
        instructorService.deleteInstructor(id);
        return ResponseEntity.noContent().build();
    }
}



