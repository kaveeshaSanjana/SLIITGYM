package com;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HelloController - Health-check endpoint for the API.
 * Returns a simple message to confirm the server is running.
 * Accessible at the root URL: GET /
 */
@RestController
public class HelloController {

    /**
     * GET / - Root health-check endpoint.
     * @return a message confirming the API is running
     */
    @GetMapping("/")
    public String hello() {
        return "IronPulse Gym Management System API is running!";
    }
}



