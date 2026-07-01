package com.service;

import com.entity.HealthRecord;
import com.exception.BusinessValidationException;
import com.exception.ResourceNotFoundException;
import com.repository.HealthRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class HealthRecordService {

    private final HealthRecordRepository healthRecordRepository;

    public HealthRecordService(HealthRecordRepository healthRecordRepository) {
        this.healthRecordRepository = healthRecordRepository;
    }

    /** Get all health records */
    @Transactional(readOnly = true)
    public List<HealthRecord> getAllHealthRecords() {
        return healthRecordRepository.findAll();
    }

    /** Find a single health record by its ID */
    @Transactional(readOnly = true)
    public Optional<HealthRecord> getHealthRecordById(String id) {
        return healthRecordRepository.findById(id);
    }

    /** Get all health records for a specific member, sorted by date (oldest first) */
    @Transactional(readOnly = true)
    public List<HealthRecord> getHealthRecordsByMember(String memberId) {
        return healthRecordRepository.findByMemberIdOrderByDateAsc(memberId);
    }

    /**
     * Save a new health record or update an existing one.
     * Validates all measurements are within realistic ranges:
     * - Height: 50-300 cm
     * - Weight: 20-500 kg
     * - Working time: 0-1440 minutes (max 24 hours)
     * - Calories burned: 0-10000
     */
    @Transactional
    public HealthRecord saveHealthRecord(HealthRecord record) {
        if (record.getHeight() < 50 || record.getHeight() > 300) {
            throw new BusinessValidationException("Height must be between 50 and 300 cm");
        }
        if (record.getWeight() < 20 || record.getWeight() > 500) {
            throw new BusinessValidationException("Weight must be between 20 and 500 kg");
        }
        if (record.getWorkingTime() < 0 || record.getWorkingTime() > 1440) {
            throw new BusinessValidationException("Working time must be between 0 and 1440 minutes");
        }
        if (record.getCaloriesBurned() < 0 || record.getCaloriesBurned() > 10000) {
            throw new BusinessValidationException("Calories burned must be between 0 and 10000");
        }
        return healthRecordRepository.save(record);
    }

    /** Delete a health record by ID - throws exception if not found */
    @Transactional
    public void deleteHealthRecord(String id) {
        if (!healthRecordRepository.existsById(id)) {
            throw new ResourceNotFoundException("Health record not found with id: " + id);
        }
        healthRecordRepository.deleteById(id);
    }
}



