package com.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * ErrorResponse DTO - Standard error response structure returned to the frontend.
 * Contains the HTTP status code, error message, optional field-level errors, and timestamp.
 * Used by GlobalExceptionHandler to return consistent error responses.
 */
public class ErrorResponse {

    /** HTTP status code (e.g. 400, 404, 500) */
    private int status;

    /** Human-readable error message */
    private String message;

    /** Map of field names to their validation error messages (for form validation errors) */
    private Map<String, String> errors;

    /** When the error occurred */
    private LocalDateTime timestamp;

    // ===================== Constructors =====================

    /** Default no-argument constructor */
    public ErrorResponse() {
    }

    /** All-arguments constructor */
    public ErrorResponse(int status, String message, Map<String, String> errors, LocalDateTime timestamp) {
        this.status = status;
        this.message = message;
        this.errors = errors;
        this.timestamp = timestamp;
    }

    /** Constructor for simple errors without field-level details */
    public ErrorResponse(int status, String message) {
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    /** Constructor for validation errors with field-level error details */
    public ErrorResponse(int status, String message, Map<String, String> errors) {
        this.status = status;
        this.message = message;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }

    // ================== Getters and Setters ==================

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Map<String, String> getErrors() { return errors; }
    public void setErrors(Map<String, String> errors) { this.errors = errors; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}


