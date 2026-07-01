package com.repository;

import com.entity.WorkoutClass;
import com.enums.ClassType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
/**
 * WorkoutClassRepository - Database access layer for WorkoutClass entity.
 * Provides custom queries to filter classes by type and trainer.
 */
@Repository
public interface WorkoutClassRepository extends JpaRepository<WorkoutClass, String> {

    /** Find all classes of a specific type (e.g. YOGA, CARDIO) */
    List<WorkoutClass> findByType(ClassType type);

    /** Find all classes taught by a specific trainer */
    List<WorkoutClass> findByTrainerId(String trainerId);

    /** Bulk-null the trainer reference on all classes assigned to the given instructor */
    @Modifying
    @Query("UPDATE WorkoutClass wc SET wc.trainer = null WHERE wc.trainer.id = :instructorId")
    void clearTrainerReference(@Param("instructorId") String instructorId);
}