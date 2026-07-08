package com.service;

import com.entity.AccessLog;
import com.entity.Member;
import com.entity.WorkoutClass;
import com.enums.MemberStatus;
import com.enums.MembershipType;
import com.exception.DuplicateResourceException;
import com.exception.ResourceNotFoundException;
import com.repository.AccessLogRepository;
import com.repository.AttendanceRepository;
import com.repository.HealthRecordRepository;
import com.repository.MemberRepository;
import com.repository.PaymentRepository;
import com.repository.UserRepository;
import com.repository.WorkoutClassRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRepository attendanceRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final WorkoutClassRepository workoutClassRepository;
    private final AccessLogRepository accessLogRepository;

    public MemberService(MemberRepository memberRepository, UserRepository userRepository,
                         PaymentRepository paymentRepository, AttendanceRepository attendanceRepository,
                         HealthRecordRepository healthRecordRepository, WorkoutClassRepository workoutClassRepository,
                         AccessLogRepository accessLogRepository) {
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.attendanceRepository = attendanceRepository;
        this.healthRecordRepository = healthRecordRepository;
        this.workoutClassRepository = workoutClassRepository;
        this.accessLogRepository = accessLogRepository;
    }

    /** Get all members from the database */
    @Transactional(readOnly = true)
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    /** Find a single member by their ID */
    @Transactional(readOnly = true)
    public Optional<Member> getMemberById(String id) {
        return memberRepository.findById(id);
    }

    /** Get all members with a specific status (ACTIVE or INACTIVE) */
    @Transactional(readOnly = true)
    public List<Member> getMembersByStatus(MemberStatus status) {
        return memberRepository.findByStatus(status);
    }

    /** Get all members with a specific membership type (REGULAR or PREMIUM) */
    @Transactional(readOnly = true)
    public List<Member> getMembersByType(MembershipType type) {
        return memberRepository.findByMembershipType(type);
    }

    /** Get all members assigned to a specific instructor */
    @Transactional(readOnly = true)
    public List<Member> getMembersByInstructor(String instructorId) {
        return memberRepository.findByInstructorId(instructorId);
    }

     /**
     * Save a new member or update an existing member.
     * Checks for duplicate email when creating a new member.
     */
    @Transactional
    public Member saveMember(Member member) {
        // Check for duplicate email when creating a new member OR updating an existing member with a different email
        userRepository.findByEmail(member.getEmail()).ifPresent(existing -> {
            if (member.getId() == null || !existing.getId().equals(member.getId())) {
                throw new DuplicateResourceException("A user with email '" + member.getEmail() + "' already exists");
            }
        });
        return memberRepository.save(member);
    }

    @Transactional
    public void deleteMember(String id) {
        if (!memberRepository.existsById(id)) {
            throw new ResourceNotFoundException("Member not found with id: " + id);
        }
        // Remove member from enrolled lists in workout classes
        for (WorkoutClass wc : workoutClassRepository.findAll()) {
            if (wc.getEnrolledMemberIds().remove(id)) {
                wc.setEnrolledCount(wc.getEnrolledMemberIds().size());
                workoutClassRepository.save(wc);
            }
        }
        // Null out member reference in access logs (log history is preserved)
        for (AccessLog log : accessLogRepository.findByMemberId(id)) {
            log.setMember(null);
            accessLogRepository.save(log);
        }
        paymentRepository.deleteAll(paymentRepository.findByMemberId(id));
        attendanceRepository.deleteAll(attendanceRepository.findByUserId(id));
        healthRecordRepository.deleteAll(healthRecordRepository.findByMemberId(id));
        memberRepository.deleteById(id);
    }

}

