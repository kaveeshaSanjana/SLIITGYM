package com.service;

import com.dto.DeviceActivityRequest;
import com.entity.Equipment;
import com.entity.EquipmentActivity;
import com.entity.Member;
import com.repository.EquipmentActivityRepository;
import com.repository.EquipmentRepository;
import com.repository.MemberRepository;
import com.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DeviceActivityService {

    private final EquipmentActivityRepository activityRepository;
    private final MemberRepository memberRepository;
    private final EquipmentRepository equipmentRepository;

    public DeviceActivityService(EquipmentActivityRepository activityRepository, 
                                 MemberRepository memberRepository, 
                                 EquipmentRepository equipmentRepository) {
        this.activityRepository = activityRepository;
        this.memberRepository = memberRepository;
        this.equipmentRepository = equipmentRepository;
    }

    public EquipmentActivity processActivity(DeviceActivityRequest req) {
        // Find Member
        Member member = memberRepository.findByCardId(req.getCardId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with card ID: " + req.getCardId()));

        return handleSessionToggle(member, req.getEquipmentId(), req.getTime());
    }

    public EquipmentActivity toggleMemberSession(String memberId, String equipmentId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + memberId));
        
        String currentTime = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
        return handleSessionToggle(member, equipmentId, currentTime);
    }

    private EquipmentActivity handleSessionToggle(Member member, String equipmentId, String time) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + equipmentId));

        String today = LocalDate.now().toString();

        Optional<EquipmentActivity> activeSession = activityRepository
                .findTopByEquipmentIdAndMemberIdAndDateAndEndTimeIsNullOrderByStartTimeDesc(
                        equipment.getId(), member.getId(), today);

        if (activeSession.isPresent()) {
            EquipmentActivity session = activeSession.get();
            session.setEndTime(time);
            return activityRepository.save(session);
        } else {
            EquipmentActivity newSession = new EquipmentActivity();
            newSession.setId(UUID.randomUUID().toString());
            newSession.setEquipment(equipment);
            newSession.setMember(member);
            newSession.setDate(today);
            newSession.setStartTime(time);
            newSession.setEndTime(null);
            return activityRepository.save(newSession);
        }
    }
    
    public Optional<EquipmentActivity> getActiveSessionForMember(String memberId) {
        String today = LocalDate.now().toString();
        // Since we don't have a specific method for finding ANY equipment by member, let's just find by memberId and filter.
        List<EquipmentActivity> memberActivities = activityRepository.findByMemberId(memberId);
        return memberActivities.stream()
                .filter(a -> today.equals(a.getDate()) && a.getEndTime() == null)
                .findFirst();
    }
    
    public List<EquipmentActivity> getAllActivities() {
        return activityRepository.findAll();
    }
}
