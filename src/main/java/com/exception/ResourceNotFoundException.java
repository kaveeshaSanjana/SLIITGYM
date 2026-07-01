package com.exception;

/**
 * ResourceNotFoundException - Thrown when a requested resource does not exist in the database.
 * Example: looking up a member, instructor, or payment by an ID that doesn't exist.
 * Handled by GlobalExceptionHandler to return HTTP 404 Not Found.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * @param message description of which resource was not found
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}


