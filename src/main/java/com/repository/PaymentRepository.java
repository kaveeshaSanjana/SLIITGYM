package com.repository;

import com.entity.Payment;
import com.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * PaymentRepository - Database access layer for Payment entity.
 * Provides custom queries to filter payments by member and payment status.
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    /** Find all payments made by a specific member */
    List<Payment> findByMemberId(String memberId);

    /** Find all payments with a specific status (PAID, PENDING, or OVERDUE) */
    List<Payment> findByStatus(PaymentStatus status);
}