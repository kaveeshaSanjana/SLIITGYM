package com.controller;

import com.dto.EquipmentRequest;
import com.entity.Equipment;
import com.enums.EquipmentStatus;
import com.service.EquipmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "*")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping
    public List<Equipment> getAllEquipment() {
        return equipmentService.getAllEquipment();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable String id) {
        return equipmentService.getEquipmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Equipment> createEquipment(@Valid @RequestBody EquipmentRequest req) {
        Equipment equipment = new Equipment(
                req.getId() != null && !req.getId().isBlank() ? req.getId() : UUID.randomUUID().toString(),
                req.getName(),
                req.getType(),
                EquipmentStatus.valueOf(req.getStatus().toUpperCase()),
                req.getLocation()
        );
        return ResponseEntity.ok(equipmentService.saveEquipment(equipment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equipment> updateEquipment(@PathVariable String id, @Valid @RequestBody EquipmentRequest req) {
        return equipmentService.getEquipmentById(id).map(equipment -> {
            equipment.setName(req.getName());
            equipment.setType(req.getType());
            equipment.setStatus(EquipmentStatus.valueOf(req.getStatus().toUpperCase()));
            equipment.setLocation(req.getLocation());
            return ResponseEntity.ok(equipmentService.saveEquipment(equipment));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable String id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.noContent().build();
    }
}
