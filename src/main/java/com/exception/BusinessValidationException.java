package com.exception;

/**
 * BusinessValidationException - Thrown when a business rule is violated.
 * Examples: negative payment amount, check-out time before check-in, capacity exceeded.
 * Handled by GlobalExceptionHandler to return HTTP 400 Bad Request.
 */
public class BusinessValidationException extends RuntimeException {

    /**
     * @param message description of the business rule that was violated
     */
    public BusinessValidationException(String message) {
        super(message);
    }
}


