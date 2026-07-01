package com.service;

import com.entity.Equipment;
import com.repository.EquipmentRepository;
import com.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public EquipmentService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public Optional<Equipment> getEquipmentById(String id) {
        return equipmentRepository.findById(id);
    }

    public Equipment saveEquipment(Equipment equipment) {
        if (equipment.getId() == null || equipment.getId().trim().isEmpty()) {
            equipment.setId("EQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return equipmentRepository.save(equipment);
    }

    public void deleteEquipment(String id) {
        if (!equipmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Equipment not found with id: " + id);
        }
        equipmentRepository.deleteById(id);
    }
}
