package com.repository;

import com.entity.Member;
import com.enums.MemberStatus;
import com.enums.MembershipType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * MemberRepository - Database access layer for Member entity.
 * Provides custom queries to filter members by status, type, and assigned instructor.
 */
@Repository
public interface MemberRepository extends JpaRepository<Member, String> {

    /** Find all members with a specific status (ACTIVE or INACTIVE) */
    List<Member> findByStatus(MemberStatus status);

    /** Find member by card ID */
    Optional<Member> findByCardId(String cardId);

    /** Find all members with a specific membership type (REGULAR or PREMIUM) */
    List<Member> findByMembershipType(MembershipType type);

    /** Find all members assigned to a specific instructor */
    List<Member> findByInstructorId(String instructorId);

    /** Bulk-null the plan reference on all members using the given plan */
    @Modifying
    @Query("UPDATE Member m SET m.plan = null WHERE m.plan.id = :planId")
    void clearPlanReference(@Param("planId") String planId);

    /** Bulk-null the instructor reference on all members assigned to the given instructor */
    @Modifying
    @Query("UPDATE Member m SET m.instructor = null WHERE m.instructor.id = :instructorId")
    void clearInstructorReference(@Param("instructorId") String instructorId);
}


