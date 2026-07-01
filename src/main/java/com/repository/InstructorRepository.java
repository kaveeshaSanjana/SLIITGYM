package com.repository;

import com.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * InstructorRepository - Database access layer for Instructor entity.
 * Uses built-in JpaRepository methods (findAll, findById, save, deleteById).
 * No custom queries needed - all instructors are fetched or managed by ID.
 */
@Repository
public interface InstructorRepository extends JpaRepository<Instructor, String> {
}


