package com.service;

import com.entity.Payment;
import com.enums.PaymentStatus;
import com.exception.BusinessValidationException;
import com.exception.ResourceNotFoundException;
import com.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * PaymentService - Business logic layer for Payment operations.
 * Handles CRUD operations for payments with amount validation.
 */
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /** Get all payments from the database */
    @Transactional(readOnly = true)
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    /** Find a single payment by its ID */
    @Transactional(readOnly = true)
    public Optional<Payment> getPaymentById(String id) {
        return paymentRepository.findById(id);
    }

    /** Get all payments made by a specific member */
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByMember(String memberId) {
        return paymentRepository.findByMemberId(memberId);
    }

    /** Get all payments with a specific status (PAID, PENDING, OVERDUE) */
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByStatus(PaymentStatus status) {
        return paymentRepository.findByStatus(status);
    }

    /**
     * Save a new payment or update an existing payment.
     * Validates that the payment amount is greater than zero.
     */
    @Transactional
    public Payment savePayment(Payment payment) {
        if (payment.getAmount() <= 0) {
            throw new BusinessValidationException("Payment amount must be greater than zero");
        }
        return paymentRepository.save(payment);
    }

    /** Delete a payment by ID - throws exception if payment not found */
    @Transactional
    public void deletePayment(String id) {
        if (!paymentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Payment not found with id: " + id);
        }
        paymentRepository.deleteById(id);
    }
}