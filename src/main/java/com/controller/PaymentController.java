package com.controller;

import com.dto.PaymentRequest;
import com.entity.Member;
import com.entity.Payment;
import com.enums.PaymentMethod;
import com.enums.PaymentStatus;
import com.exception.ResourceNotFoundException;
import com.service.MemberService;
import com.service.PaymentService;
import com.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * PaymentController - REST API endpoints for Payment operations.
 * Handles creating, reading, updating, and deleting payments.
 * Supports filtering payments by member.
 * Base URL: /api/payments
 */
@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;
    private final MemberService memberService;
    private final EmailService emailService;

    public PaymentController(PaymentService paymentService, MemberService memberService, EmailService emailService) {
        this.paymentService = paymentService;
        this.memberService = memberService;
        this.emailService = emailService;
    }

    /** GET /api/payments - Get all payments */
    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    /** GET /api/payments/{id} - Get a single payment by ID */
    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable String id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/payments/member/{memberId} - Get all payments for a specific member */
    @GetMapping("/member/{memberId}")
    public List<Payment> getPaymentsByMember(@PathVariable String memberId) {
        return paymentService.getPaymentsByMember(memberId);
    }

    /**
     * POST /api/payments - Create a new payment.
     * Looks up the member, generates a unique payment ID, converts
     * status/method strings to enum values, saves, and sends a payment confirmation email.
     */
    @PostMapping
    public ResponseEntity<Payment> createPayment(@Valid @RequestBody PaymentRequest req) {
        // Look up the member to ensure they exist
        Member member = memberService.getMemberById(req.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + req.getMemberId()));

        Payment payment = new Payment();
        // Generate a unique payment ID with "pay" prefix
        payment.setId("pay" + UUID.randomUUID().toString().substring(0, 6));
        payment.setMember(member);
        payment.setAmount(req.getAmount());
        payment.setDate(req.getDate());
        // Convert string values to enum constants
        payment.setStatus(PaymentStatus.valueOf(req.getStatus().toUpperCase()));
        payment.setMethod(PaymentMethod.valueOf(req.getMethod().toUpperCase()));
        payment.setPlanName(req.getPlanName());
        payment.setPaymentType(req.getPaymentType() != null ? req.getPaymentType() : "PHYSICAL");
        payment.setSlipReference(req.getSlipReference());
        payment.setSlipImageUrl(req.getSlipImageUrl());
        payment.setRemarks(req.getRemarks());

        Payment savedPayment = paymentService.savePayment(payment);

        // Send payment confirmation email to the member (async - does not block response)
        emailService.sendPaymentConfirmationEmail(savedPayment);

        return ResponseEntity.ok(savedPayment);
    }

    /**
     * PUT /api/payments/{id} - Update an existing payment.
     * Finds the payment by ID, updates amount, date, status, method, and plan name.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable String id, @Valid @RequestBody PaymentRequest req) {
        return paymentService.getPaymentById(id).map(payment -> {
            payment.setAmount(req.getAmount());
            payment.setDate(req.getDate());
            payment.setStatus(PaymentStatus.valueOf(req.getStatus().toUpperCase()));
            payment.setMethod(PaymentMethod.valueOf(req.getMethod().toUpperCase()));
            payment.setPlanName(req.getPlanName());
            if (req.getPaymentType() != null) payment.setPaymentType(req.getPaymentType());
            if (req.getSlipReference() != null) payment.setSlipReference(req.getSlipReference());
            if (req.getSlipImageUrl() != null) payment.setSlipImageUrl(req.getSlipImageUrl());
            if (req.getRemarks() != null) payment.setRemarks(req.getRemarks());
            if (req.getVerifiedBy() != null) payment.setVerifiedBy(req.getVerifiedBy());
            if (req.getVerifiedDate() != null) payment.setVerifiedDate(req.getVerifiedDate());
            return ResponseEntity.ok(paymentService.savePayment(payment));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** PUT /api/payments/{id}/verify - Admin verifies a payment slip */
    @PutMapping("/{id}/verify")
    public ResponseEntity<Payment> verifyPayment(@PathVariable String id,
                                                 @RequestParam String adminId,
                                                 @RequestParam String action) {
        return paymentService.getPaymentById(id).map(payment -> {
            if ("approve".equalsIgnoreCase(action)) {
                payment.setStatus(PaymentStatus.PAID);
                payment.setVerifiedBy(adminId);
                payment.setVerifiedDate(java.time.LocalDate.now().toString());
                payment.setRemarks("Verified and approved");
            } else if ("reject".equalsIgnoreCase(action)) {
                payment.setStatus(PaymentStatus.OVERDUE);
                payment.setVerifiedBy(adminId);
                payment.setVerifiedDate(java.time.LocalDate.now().toString());
                payment.setRemarks("Payment slip rejected");
            }
            Payment saved = paymentService.savePayment(payment);
            emailService.sendPaymentConfirmationEmail(saved);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/payments/{id} - Delete a payment */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable String id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}