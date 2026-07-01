package com.exception;

import com.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * GlobalExceptionHandler - Centralized exception handling for all REST controllers.
 * Catches specific exceptions thrown anywhere in the application and converts them
 * into consistent ErrorResponse JSON objects with appropriate HTTP status codes.
 *
 * Exception -> HTTP Status mapping:
 * - MethodArgumentNotValidException -> 400 Bad Request (validation errors with field details)
 * - BusinessValidationException     -> 400 Bad Request (business rule violation)
 * - IllegalArgumentException        -> 400 Bad Request (invalid argument)
 * - ResourceNotFoundException       -> 404 Not Found
 * - DuplicateResourceException      -> 409 Conflict
 * - Exception (generic)             -> 500 Internal Server Error
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handles DTO validation errors (e.g. @NotBlank, @Email, @Positive).
     * Collects all field-level errors into a map and returns them to the frontend.
     *
     * @param ex the validation exception containing field errors
     * @return 400 response with field-by-field error messages
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        ErrorResponse response = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed",
                errors
        );
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handles resource-not-found errors (e.g. member, instructor, payment not found by ID).
     *
     * @param ex the not-found exception
     * @return 404 response with the error message
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handles duplicate resource errors (e.g. creating a user with an email that already exists).
     *
     * @param ex the duplicate-resource exception
     * @return 409 Conflict response with the error message
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateResourceException ex) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    /**
     * Handles business rule violations (e.g. negative price, checkout before checkin).
     *
     * @param ex the business validation exception
     * @return 400 response with the error message
     */
    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<ErrorResponse> handleBusinessValidation(BusinessValidationException ex) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage()
        );
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handles illegal argument errors (e.g. invalid enum value conversion).
     *
     * @param ex the illegal argument exception
     * @return 400 response with the error message
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage()
        );
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Catch-all handler for any unexpected exceptions.
     * Returns a generic error message to avoid leaking internal details.
     *
     * @param ex the unexpected exception
     * @return 500 Internal Server Error response
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        ErrorResponse response = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected error occurred"
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}


