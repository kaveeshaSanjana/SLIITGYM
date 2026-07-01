package com.controller;

import com.dto.CardAccessRequest;
import com.dto.CardAccessResponse;
import com.dto.DeviceRequest;
import com.entity.*;
import com.enums.AccessResult;
import com.enums.DeviceStatus;
import com.enums.MemberStatus;
import com.enums.PaymentStatus;
import com.exception.ResourceNotFoundException;
import com.service.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * DeviceController - REST API endpoints for Door Device and Access Control operations.
 * Handles CRUD for ESP32 door devices, heartbeat monitoring, NFC card access control,
 * and access log retrieval. Core endpoint for the IoT door access system.
 * Base URL: /api/devices
 */
@RestController
@RequestMapping("/api/devices")
@CrossOrigin(origins = "*")
public class DeviceController {

    private final DoorDeviceService deviceService;
    private final AccessLogService accessLogService;
    private final MemberService memberService;
    private final PaymentService paymentService;
    private final AttendanceService attendanceService;

    public DeviceController(DoorDeviceService deviceService, AccessLogService accessLogService,
                            MemberService memberService, PaymentService paymentService,
                            AttendanceService attendanceService) {
        this.deviceService = deviceService;
        this.accessLogService = accessLogService;
        this.memberService = memberService;
        this.paymentService = paymentService;
        this.attendanceService = attendanceService;
    }

    // =====================================================================
    //  DEVICE CRUD ENDPOINTS
    // =====================================================================

    /** GET /api/devices - Get all registered door devices */
    @GetMapping
    public List<DoorDevice> getAllDevices() {
        return deviceService.getAllDevices();
    }

    /** GET /api/devices/{id} - Get a single device by ID */
    @GetMapping("/{id}")
    public ResponseEntity<DoorDevice> getDeviceById(@PathVariable String id) {
        return deviceService.getDeviceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/devices - Register a new door device with a generated ID */
    @PostMapping
    public ResponseEntity<DoorDevice> createDevice(@Valid @RequestBody DeviceRequest req) {
        DoorDevice device = new DoorDevice();
        device.setId("dev" + UUID.randomUUID().toString().substring(0, 6));
        device.setName(req.getName());
        device.setLocation(req.getLocation());
        device.setStatus(DeviceStatus.ONLINE);
        device.setTotalAccessToday(0);
        return ResponseEntity.ok(deviceService.saveDevice(device));
    }

    /** PUT /api/devices/{id} - Update device name and location */
    @PutMapping("/{id}")
    public ResponseEntity<DoorDevice> updateDevice(@PathVariable String id, @Valid @RequestBody DeviceRequest req) {
        return deviceService.getDeviceById(id).map(device -> {
            device.setName(req.getName());
            device.setLocation(req.getLocation());
            return ResponseEntity.ok(deviceService.saveDevice(device));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/devices/{id} - Remove a door device */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable String id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }

    // =====================================================================
    //  ESP32 IOT ENDPOINTS
    // =====================================================================

    /**
     * POST /api/devices/{id}/heartbeat - ESP32 heartbeat endpoint.
     * Device pings this periodically to indicate it is still online.
     * Updates the device status to ONLINE and records the last heartbeat time.
     */
    @PostMapping("/{id}/heartbeat")
    public ResponseEntity<Void> heartbeat(@PathVariable String id) {
        return deviceService.getDeviceById(id).map(device -> {
            device.setStatus(DeviceStatus.ONLINE);
            device.setLastHeartbeat(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
            deviceService.saveDevice(device);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/devices/{deviceId}/access - ESP32 NFC card tap endpoint.
     * Called when a member taps their NFC card on the door reader.
     * Validates: (1) card is registered, (2) member is ACTIVE, (3) has a PAID payment.
     * If all checks pass, access is GRANTED and attendance is auto-marked.
     * Every attempt (granted or denied) is logged in the access_logs table.
     */
    @PostMapping("/{deviceId}/access")
    public ResponseEntity<CardAccessResponse> checkAccess(
            @PathVariable String deviceId,
            @Valid @RequestBody CardAccessRequest req) {

        DoorDevice device = deviceService.getDeviceById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found: " + deviceId));

        String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        String now = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));

        // Step 1: Find member by their NFC card ID
        Optional<Member> memberOpt = memberService.getAllMembers().stream()
                .filter(m -> req.getCardId().equals(m.getCardId()))
                .findFirst();

        if (memberOpt.isEmpty()) {
            AccessLog log = createAccessLog(device, null, req.getCardId(), today, now, AccessResult.DENIED, "Card not registered");
            accessLogService.saveAccessLog(log);
            return ResponseEntity.ok(new CardAccessResponse(false, null, null, "Card not registered"));
        }

        Member member = memberOpt.get();

        // Step 2: Check if membership is active
        if (member.getStatus() != MemberStatus.ACTIVE) {
            AccessLog log = createAccessLog(device, member, req.getCardId(), today, now, AccessResult.DENIED, "Membership inactive");
            accessLogService.saveAccessLog(log);
            return ResponseEntity.ok(new CardAccessResponse(false, member.getName(), member.getId(), "Membership inactive"));
        }

        // Step 3: Verify member has at least one PAID payment
        List<Payment> payments = paymentService.getPaymentsByMember(member.getId());
        boolean hasPaidPayment = payments.stream()
                .anyMatch(p -> p.getStatus() == PaymentStatus.PAID);

        if (!hasPaidPayment) {
            AccessLog log = createAccessLog(device, member, req.getCardId(), today, now, AccessResult.DENIED, "No valid payment found");
            accessLogService.saveAccessLog(log);
            return ResponseEntity.ok(new CardAccessResponse(false, member.getName(), member.getId(), "No valid payment found"));
        }

        // All checks passed - GRANT access and auto-mark attendance
        // First tap today = check-in, second tap (no checkout yet) = check-out
        List<Attendance> todayAttendance = attendanceService.getAttendanceByUser(member.getId())
                .stream().filter(a -> today.equals(a.getDate())).toList();
        Attendance openRecord = todayAttendance.stream()
                .filter(a -> a.getCheckOut() == null).findFirst().orElse(null);
        if (openRecord != null) {
            openRecord.setCheckOut(now);
            attendanceService.saveAttendance(openRecord);
        } else {
            Attendance attendance = new Attendance();
            attendance.setId("att" + UUID.randomUUID().toString().substring(0, 6));
            attendance.setUser(member);
            attendance.setDate(today);
            attendance.setCheckIn(now);
            attendanceService.saveAttendance(attendance);
        }

        // Log the successful access
        AccessLog log = createAccessLog(device, member, req.getCardId(), today, now, AccessResult.GRANTED, "Access granted");
        accessLogService.saveAccessLog(log);

        // Update the device's daily access counter
        long todayCount = accessLogService.countGrantedAccessToday(deviceId, today);
        device.setTotalAccessToday((int) todayCount);
        deviceService.saveDevice(device);

        return ResponseEntity.ok(new CardAccessResponse(true, member.getName(), member.getId(), "Access granted"));
    }

    // =====================================================================
    //  ACCESS LOG QUERY ENDPOINTS
    // =====================================================================

    /** GET /api/devices/{deviceId}/access-logs - Get access logs for a specific device */
    @GetMapping("/{deviceId}/access-logs")
    public List<AccessLog> getDeviceAccessLogs(@PathVariable String deviceId) {
        return accessLogService.getAccessLogsByDevice(deviceId);
    }

    /** GET /api/devices/access-logs - Get all access logs across all devices */
    @GetMapping("/access-logs")
    public List<AccessLog> getAllAccessLogs() {
        return accessLogService.getAllAccessLogs();
    }

    /** GET /api/devices/access-logs/date/{date} - Get access logs for a specific date */
    @GetMapping("/access-logs/date/{date}")
    public List<AccessLog> getAccessLogsByDate(@PathVariable String date) {
        return accessLogService.getAccessLogsByDate(date);
    }

    // =====================================================================
    //  PRIVATE HELPER
    // =====================================================================

    /** Creates an AccessLog entity with a generated ID and given details */
    private AccessLog createAccessLog(DoorDevice device, Member member, String cardId,
                                       String date, String time, AccessResult result, String reason) {
        AccessLog log = new AccessLog();
        log.setId("log" + UUID.randomUUID().toString().substring(0, 6));
        log.setDevice(device);
        log.setMember(member);
        log.setCardId(cardId);
        log.setDate(date);
        log.setTimestamp(time);
        log.setResult(result);
        log.setReason(reason);
        return log;
    }
}
