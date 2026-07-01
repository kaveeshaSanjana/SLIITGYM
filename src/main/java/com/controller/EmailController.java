package com.controller;

import com.dto.EmailRequest;
import com.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * EmailController - REST API endpoint for sending custom emails.
 * Provides an endpoint for the admin to send manual email notifications.
 * Automatic emails (welcome, payment receipt) are triggered by other controllers.
 * Base URL: /api/email
 */

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*") // Allow CORS for all origins (adjust as needed for security)
public class EmailController {

    public final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

     /**
     * POST /api/email/send - Send a custom email to any recipient.
     * Intended for admin use to send announcements, reminders, or custom messages.
     *
     * @param request contains toEmail, subject, and HTML body
     * @return success message confirming the email was queued for sending
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendCustomEmail(@Valid @RequestBody EmailRequest request) {
        emailService.sendCustomEmail(request.getToEmail(), request.getSubject(), request.getBody());
        return ResponseEntity.ok(Map.of(
                "message", "Email queued for sending to " + request.getToEmail(),
                "status", "success"
        ));
    }

}
