package com.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dto.MembershipPlanRequest;
import com.entity.MembershipPlan;
import com.service.MembershipPlanService;

import jakarta.validation.Valid;

import java.util.List;


/**
 * MembershipPlanController - REST API endpoints for Membership Plan operations.
 * Handles creating, reading, updating, and deleting membership plans.
 * Base URL: /api/plans
 */

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "*")

public class MembershipPlanController{

    private final MembershipPlanService planService;

    public MembershipPlanController(MembershipPlanService planService) {
        this.planService = planService;
    }

    /** GET /api/plans - Get all membership plans */
    @GetMapping
    public List<MembershipPlan> getAllPlans() {
        return planService.getAllPlans();
    }

    /** GET /api/plans/{id} - Get a single plan by ID */
    @GetMapping("/{id}")
    public ResponseEntity<MembershipPlan> getPlanById(@PathVariable String id) {
        return planService.getPlanById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/plans - Create a new membership plan */
    @PostMapping
    public ResponseEntity<MembershipPlan> createPlan(@Valid @RequestBody MembershipPlanRequest req) {
        MembershipPlan plan = new MembershipPlan();
        plan.setId(req.getId());
        plan.setName(req.getName());
        plan.setPrice(req.getPrice());
        plan.setDuration(req.getDuration());
        plan.setBenefits(req.getBenefits());
        return ResponseEntity.ok(planService.savePlan(plan));
    }

    /** PUT /api/plans/{id} - Update an existing membership plan */
    @PutMapping("/{id}")
    public ResponseEntity<MembershipPlan> updatePlan(@PathVariable String id, @Valid @RequestBody MembershipPlanRequest req) {
        return planService.getPlanById(id).map(plan -> {
            plan.setName(req.getName());
            plan.setPrice(req.getPrice());
            plan.setDuration(req.getDuration());
            plan.setBenefits(req.getBenefits());
            return ResponseEntity.ok(planService.savePlan(plan));   
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/plans/{id} - Delete a membership plan */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable String id) {
        planService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}


