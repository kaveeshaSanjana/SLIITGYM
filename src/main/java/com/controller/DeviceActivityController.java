package com.controller;

import com.dto.DeviceActivityRequest;
import com.dto.MemberActivityRequest;
import com.entity.EquipmentActivity;
import com.service.DeviceActivityService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/equipment")
@CrossOrigin(origins = "*")
public class DeviceActivityController {

    private final DeviceActivityService activityService;

    @Value("${app.device.api-key}")
    private String expectedApiKey;

    public DeviceActivityController(DeviceActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping("/activity")
    public ResponseEntity<?> recordActivity(
            @RequestHeader(value = "X-API-KEY", required = false) String apiKey,
            @Valid @RequestBody DeviceActivityRequest req) {
        
        if (apiKey == null || !apiKey.equals(expectedApiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing API Key");
        }

        try {
            EquipmentActivity activity = activityService.processActivity(req);
            return ResponseEntity.ok(activity);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/activity/toggle")
    public ResponseEntity<?> toggleMemberActivity(@Valid @RequestBody MemberActivityRequest req) {
        try {
            EquipmentActivity activity = activityService.toggleMemberSession(req.getMemberId(), req.getEquipmentId());
            return ResponseEntity.ok(activity);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/activity/active/{memberId}")
    public ResponseEntity<?> getActiveSession(@PathVariable String memberId) {
        return activityService.getActiveSessionForMember(memberId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
    
    @GetMapping("/activity")
    public ResponseEntity<List<EquipmentActivity>> getAllActivities() {
        return ResponseEntity.ok(activityService.getAllActivities());
    }
}
