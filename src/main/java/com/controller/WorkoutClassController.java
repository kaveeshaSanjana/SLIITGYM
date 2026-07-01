package com.controller;

import com.dto.WorkoutClassRequest;
import com.entity.Instructor;
import com.entity.WorkoutClass;
import com.enums.ClassType;
import com.exception.ResourceNotFoundException;
import com.service.InstructorService;
import com.service.WorkoutClassService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * WorkoutClassController - REST API endpoints for Workout Class operations.
 * Handles creating, reading, updating, and deleting workout classes.
 * Supports filtering by class type and trainer.
 * Base URL: /api/classes
 */
@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*")
public class WorkoutClassController {
    private final WorkoutClassService classService;
    private final InstructorService instructorService;

    public WorkoutClassController(WorkoutClassService classService, InstructorService instructorService) {
        this.classService = classService;
        this.instructorService = instructorService;
    }

    /** GET /api/classes - Get all workout classes */
    @GetMapping
    public List<WorkoutClass> getAllClasses() {
        return classService.getAllClasses();
    }

    /** GET /api/classes/{id} - Get a single workout class by ID */
    @GetMapping("/{id}")
    public ResponseEntity<WorkoutClass> getClassById(@PathVariable String id) {
        return classService.getClassById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/classes/type/{type} - Get all classes of a specific type (e.g., YOGA, CARDIO) */
    @GetMapping("/type/{type}")
    public List<WorkoutClass> getClassesByType(@PathVariable String type) {
        return classService.getClassesByType(ClassType.valueOf(type.toUpperCase()));
    }

    /** GET /api/classes/trainer/{trainerId} - Get all classes taught by a specific trainer */
    @GetMapping("/trainer/{trainerId}")
    public List<WorkoutClass> getClassesByTrainer(@PathVariable String trainerId) {
        return classService.getClassesByTrainer(trainerId);
    }

    /**
     * POST /api/classes - Create a new workout class.
     * Looks up the trainer (instructor) by trainerId and builds the entity.
     */
    @PostMapping
    public ResponseEntity<WorkoutClass> createClass(@Valid @RequestBody WorkoutClassRequest req) {
        // Look up the trainer to ensure they exist
        Instructor trainer = instructorService.getInstructorById(req.getTrainerId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + req.getTrainerId()));

        WorkoutClass workoutClass = new WorkoutClass();
        workoutClass.setId(req.getId());
        workoutClass.setName(req.getName());
        workoutClass.setType(ClassType.valueOf(req.getType().toUpperCase()));
        workoutClass.setTrainer(trainer);
        workoutClass.setSchedule(req.getSchedule());
        workoutClass.setCapacity(req.getCapacity());
        workoutClass.setEnrolledCount(req.getEnrolledCount());
        if (req.getEnrolledMemberIds() != null) workoutClass.setEnrolledMemberIds(req.getEnrolledMemberIds());
        return ResponseEntity.ok(classService.saveClass(workoutClass));
    }

    /**
     * PUT /api/classes/{id} - Update an existing workout class.
     * Finds the class by ID, updates fields, and reassigns trainer if provided.
     */
    @PutMapping("/{id}")
    public ResponseEntity<WorkoutClass> updateClass(@PathVariable String id, @Valid @RequestBody WorkoutClassRequest req) {
        return classService.getClassById(id).map(wc -> {
            wc.setName(req.getName());
            wc.setType(ClassType.valueOf(req.getType().toUpperCase()));
            wc.setSchedule(req.getSchedule());
            wc.setCapacity(req.getCapacity());
            wc.setEnrolledCount(req.getEnrolledCount());
            if (req.getEnrolledMemberIds() != null) wc.setEnrolledMemberIds(req.getEnrolledMemberIds());
            // Update trainer assignment if trainerId is provided
            if (req.getTrainerId() != null && !req.getTrainerId().isBlank()) {
                Instructor trainer = instructorService.getInstructorById(req.getTrainerId())
                        .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + req.getTrainerId()));
                wc.setTrainer(trainer);
            }
            return ResponseEntity.ok(classService.saveClass(wc));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/classes/{id} - Delete a workout class */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable String id) {
        classService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }
}

