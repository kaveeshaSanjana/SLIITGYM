package com.exception;

/**
 * DuplicateResourceException - Thrown when attempting to create a resource that already exists.
 * Example: registering a member or instructor with an email that is already in use.
 * Handled by GlobalExceptionHandler to return HTTP 409 Conflict.
 */
public class DuplicateResourceException extends RuntimeException {

    /**
     * @param message description of which resource is duplicated
     */
    public DuplicateResourceException(String message) {
        super(message);
    }
}


