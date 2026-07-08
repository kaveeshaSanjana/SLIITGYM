package com.service;

import com.entity.Instructor;
import com.exception.DuplicateResourceException;
import com.exception.ResourceNotFoundException;
import com.repository.InstructorRepository;
import com.repository.MemberRepository;
import com.repository.UserRepository;
import com.repository.WorkoutClassRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * InstructorService - Business logic layer for Instructor operations.
 * Handles CRUD operations for gym instructors/trainers, including duplicate email checking.
 */
@Service
public class InstructorService {

    private final InstructorRepository instructorRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final WorkoutClassRepository workoutClassRepository;

    public InstructorService(InstructorRepository instructorRepository, MemberRepository memberRepository, UserRepository userRepository, WorkoutClassRepository workoutClassRepository) {
        this.instructorRepository = instructorRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.workoutClassRepository = workoutClassRepository;
    }

    /** Get all instructors from the database */
    @Transactional(readOnly = true)
    public List<Instructor> getAllInstructors() {
        return instructorRepository.findAll();
    }

    /** Find a single instructor by their ID */
    @Transactional(readOnly = true)
    public Optional<Instructor> getInstructorById(String id) {
        return instructorRepository.findById(id);
    }

    /**
     * Save a new instructor or update an existing instructor.
     * Checks for duplicate email when creating a new instructor.
     */
    @Transactional
    public Instructor saveInstructor(Instructor instructor) {
        // Check for duplicate email when creating a new instructor OR updating an existing instructor with a different email
        userRepository.findByEmail(instructor.getEmail()).ifPresent(existing -> {
            if (instructor.getId() == null || !existing.getId().equals(instructor.getId())) {
                throw new DuplicateResourceException("A user with email '" + instructor.getEmail() + "' already exists");
            }
        });
        return instructorRepository.save(instructor);
    }

    /** Delete an instructor by ID - unassigns members and workout classes first to avoid FK constraint */
    @Transactional
    public void deleteInstructor(String id) {
        if (!instructorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Instructor not found with id: " + id);
        }
        memberRepository.clearInstructorReference(id);
        workoutClassRepository.clearTrainerReference(id);
        instructorRepository.deleteById(id);
    }
}

