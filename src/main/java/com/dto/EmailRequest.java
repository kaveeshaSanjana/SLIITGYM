package com.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * EmailRequest DTO - Data sent from the frontend to send a custom email.
 * Used by the POST /api/email/send endpoint for admin-triggered emails.
 */
public class EmailRequest {

    /** Recipient's email address */
    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String toEmail;

    /** Subject line of the email */
    @NotBlank(message = "Subject is required")
    private String subject;

    /** HTML body content of the email */
    @NotBlank(message = "Email body is required")
    private String body;

    // ===================== Constructors =====================

    /** Default no-argument constructor */
    public EmailRequest() {
    }

    /** All-arguments constructor */
    public EmailRequest(String toEmail, String subject, String body) {
        this.toEmail = toEmail;
        this.subject = subject;
        this.body = body;
    }

    // ================== Getters and Setters ==================

    public String getToEmail() { return toEmail; }
    public void setToEmail(String toEmail) { this.toEmail = toEmail; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}


