package com.repository;

import com.entity.EquipmentActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentActivityRepository extends JpaRepository<EquipmentActivity, String> {
    
    Optional<EquipmentActivity> findTopByEquipmentIdAndMemberIdAndDateAndEndTimeIsNullOrderByStartTimeDesc(String equipmentId, String memberId, String date);
    
    List<EquipmentActivity> findByEquipmentId(String equipmentId);
    
    List<EquipmentActivity> findByMemberId(String memberId);
}
