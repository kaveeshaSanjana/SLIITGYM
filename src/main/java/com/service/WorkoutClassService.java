package com.service;

import com.entity.WorkoutClass;
import com.enums.ClassType;
import com.exception.BusinessValidationException;
import com.exception.ResourceNotFoundException;
import com.repository.WorkoutClassRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * WorkoutClassService - Business logic layer for WorkoutClass operations.
 * Handles CRUD operations for gym workout classes with capacity and enrollment validation.
 */
@Service
public class WorkoutClassService {

    private final WorkoutClassRepository workoutClassRepository;

    public WorkoutClassService(WorkoutClassRepository workoutClassRepository) {
        this.workoutClassRepository = workoutClassRepository;
    }

    /** Get all workout classes */
    @Transactional(readOnly = true)
    public List<WorkoutClass> getAllClasses() {
        return workoutClassRepository.findAll();
    }

    /** Find a single class by its ID */
    @Transactional(readOnly = true)
    public Optional<WorkoutClass> getClassById(String id) {
        return workoutClassRepository.findById(id);
    }

    /** Get all classes of a specific type (e.g. YOGA, CARDIO) */
    @Transactional(readOnly = true)
    public List<WorkoutClass> getClassesByType(ClassType type) {
        return workoutClassRepository.findByType(type);
    }

    /** Get all classes taught by a specific trainer */
    @Transactional(readOnly = true)
    public List<WorkoutClass> getClassesByTrainer(String trainerId) {
        return workoutClassRepository.findByTrainerId(trainerId);
    }

    /**
     * Save a new class or update an existing class.
     * Validates that capacity is positive and enrolled count doesn't exceed capacity.
     */
    @Transactional
    public WorkoutClass saveClass(WorkoutClass workoutClass) {
        // Capacity must be at least 1
        if (workoutClass.getCapacity() <= 0) {
            throw new BusinessValidationException("Class capacity must be greater than zero");
        }
        // Cannot have more enrolled members than the class can hold
        if (workoutClass.getEnrolledCount() > workoutClass.getCapacity()) {
            throw new BusinessValidationException("Enrolled count cannot exceed class capacity");
        }
        return workoutClassRepository.save(workoutClass);
    }

    /** Delete a class by ID - throws exception if class not found */
    @Transactional
    public void deleteClass(String id) {
        if (!workoutClassRepository.existsById(id)) {
            throw new ResourceNotFoundException("Workout class not found with id: " + id);
        }
        workoutClassRepository.deleteById(id);
    }
}