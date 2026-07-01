package com.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.entity.MembershipPlan;
import com.exception.BusinessValidationException;
import com.exception.ResourceNotFoundException;
import com.repository.MemberRepository;
import com.repository.MembershipPlanRepository;

import java.util.List;
import java.util.Optional;

/**
 * MembershipPlanService - Business logic layer for MembershipPlan operations.
 * Handles CRUD operations for gym membership plans with price validation.
 */
@Service
public class MembershipPlanService {

    private final MembershipPlanRepository membershipPlanRepository;
    private final MemberRepository memberRepository;

    public MembershipPlanService(MembershipPlanRepository membershipPlanRepository, MemberRepository memberRepository) {
        this.membershipPlanRepository = membershipPlanRepository;
        this.memberRepository = memberRepository;
    }

    /** Get all membership plans. */
    @Transactional(readOnly = true)
    public List<MembershipPlan> getAllPlans() {
        return membershipPlanRepository.findAll();
    }

    /** Find a single plan by its ID */
    @Transactional(readOnly = true)
    public Optional<MembershipPlan> getPlanById(String id) {
        return membershipPlanRepository.findById(id);
    }

    /**
     * Save a new plan or update an existing plan.
     * Validates that price is greater than zero before saving.
     */
    @Transactional
    public MembershipPlan savePlan(MembershipPlan plan) {
        if (plan.getPrice() <= 0) {
            throw new BusinessValidationException("Plan price must be greater than zero");
        }
        return membershipPlanRepository.save(plan);
    }

    /** Delete a plan by ID - unassigns members from this plan first to avoid FK constraint */
    @Transactional
    public void deletePlan(String id) {
        if (!membershipPlanRepository.existsById(id)) {
            throw new ResourceNotFoundException("Membership plan not found with id: " + id);
        }
        memberRepository.clearPlanReference(id);
        membershipPlanRepository.deleteById(id);
    }



}

