package com.controller;

import com.dto.MemberRequest;
import com.entity.Instructor;
import com.entity.Member;
import com.entity.MembershipPlan;
import com.enums.MemberStatus;
import com.enums.MembershipType;
import com.enums.Role;
import com.exception.ResourceNotFoundException;
import com.service.InstructorService;
import com.service.MemberService;
import com.service.MembershipPlanService;
import com.service.EmailService;
import com.service.SmsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {

    private final MemberService memberService;
    private final MembershipPlanService planService;
    private final InstructorService instructorService;
    private final EmailService emailService;
    private final SmsService smsService;

    public MemberController(MemberService memberService, MembershipPlanService planService, InstructorService instructorService, EmailService emailService, SmsService smsService) {
        this.memberService = memberService;
        this.planService = planService;
        this.instructorService = instructorService;
        this.emailService = emailService;
        this.smsService = smsService;
    }



    @GetMapping
    public List<Member> getAllMembers() {
        return memberService.getAllMembers();
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable String id) {
        return memberService.getMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/instructor/{instructorId}")
    public List<Member> getMembersByInstructor(@PathVariable String instructorId) {
        return memberService.getMembersByInstructor(instructorId);
    }
    
     @PostMapping
    public ResponseEntity<Member> createMember(@Valid @RequestBody MemberRequest req) {
        Member member = new Member();
        member.setId(req.getId());
        member.setName(req.getName());
        member.setEmail(req.getEmail());
        member.setRole(Role.MEMBER);
        member.setAvatar(req.getAvatar());
        member.setJoinedDate(req.getJoinedDate());
        member.setMembershipType(MembershipType.valueOf(req.getMembershipType().toUpperCase()));
        member.setStatus(MemberStatus.valueOf(req.getStatus().toUpperCase()));
        member.setQrCode(req.getQrCode());
        member.setPhone(req.getPhone());
        member.setAddress(req.getAddress());
        member.setCardId(req.getCardId());
        member.setOnboarded(true);

        // Look up and assign membership plan if provided
        if (req.getPlanId() != null && !req.getPlanId().isBlank()) {
            MembershipPlan plan = planService.getPlanById(req.getPlanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + req.getPlanId()));
            member.setPlan(plan);
        }
        // Look up and assign instructor if provided
        if (req.getInstructorId() != null && !req.getInstructorId().isBlank()) {
            Instructor instructor = instructorService.getInstructorById(req.getInstructorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + req.getInstructorId()));
            member.setInstructor(instructor);
        }

        Member savedMember = memberService.saveMember(member);

        // Send welcome email to the new member (async - does not block response)
        emailService.sendMemberWelcomeEmail(savedMember);

        // Send welcome SMS
        String planName = savedMember.getPlan() != null ? savedMember.getPlan().getName() : "None";
        String instructorName = savedMember.getInstructor() != null ? savedMember.getInstructor().getName() : "None";
        String cardId = savedMember.getCardId() != null ? savedMember.getCardId() : "N/A";
        
        String smsMessage = String.format("Welcome to IronPulse Gym, %s! You have successfully registered. Membership: %s. Plan: %s. Instructor: %s. Card ID: %s.",
                savedMember.getName(), 
                savedMember.getMembershipType(), 
                planName, 
                instructorName, 
                cardId
        );
        
        smsService.sendSms(savedMember.getPhone(), smsMessage);

        return ResponseEntity.ok(savedMember);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable String id, @Valid @RequestBody MemberRequest req) {
        return memberService.getMemberById(id).map(member -> {
            member.setName(req.getName());
            member.setEmail(req.getEmail());
            member.setAvatar(req.getAvatar());
            member.setPhone(req.getPhone());
            member.setAddress(req.getAddress());
            member.setCardId(req.getCardId());
            member.setQrCode(req.getQrCode());
            member.setMembershipType(MembershipType.valueOf(req.getMembershipType().toUpperCase()));
            member.setStatus(MemberStatus.valueOf(req.getStatus().toUpperCase()));

            if (req.getPlanId() != null && !req.getPlanId().isBlank()) {
                MembershipPlan plan = planService.getPlanById(req.getPlanId())
                        .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + req.getPlanId()));
                member.setPlan(plan);
            } else {
                member.setPlan(null);
            }
            if (req.getInstructorId() != null && !req.getInstructorId().isBlank()) {
                Instructor instructor = instructorService.getInstructorById(req.getInstructorId())
                        .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + req.getInstructorId()));
                member.setInstructor(instructor);
            } else {
                member.setInstructor(null);
            }

            return ResponseEntity.ok(memberService.saveMember(member));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable String id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
}



