package com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * DemoApplication - Entry point for the IronPulse Gym Management System.
 * Spring Boot auto-configures components, JPA repositories, and embedded web server.
 * Launches on port 8080 with an H2 in-memory database (see application.properties).
 *
 * @EnableAsync enables asynchronous email sending so API responses are not delayed.
 */
@SpringBootApplication
@EnableAsync
public class GymApplication {

    /**
     * Main method - starts the Spring Boot application.
     * @param args command-line arguments (not used)
     */

    public static void main(String[] args) {
        SpringApplication.run(GymApplication.class, args);
    }
}





