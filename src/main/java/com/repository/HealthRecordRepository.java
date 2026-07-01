package com.repository;

import com.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * HealthRecordRepository - Database access layer for HealthRecord entity.
 * Provides custom queries to fetch health records by member, with optional sorting.
 */
@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, String> {

    /** Find all health records for a specific member */

    List<HealthRecord> findByMemberId(String memberId);

    /** Find all health records for a specific member, sorted by date (oldest first) */
    List<HealthRecord> findByMemberIdOrderByDateAsc(String memberId);
}
