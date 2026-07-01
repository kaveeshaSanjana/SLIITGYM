package com.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * SchemaMigration - Applies DDL fixes that Hibernate ddl-auto=update cannot handle.
 * Runs before DataSeeder (Order 1 vs Order 2).
 */
@Component
@Order(1)
public class SchemaMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public SchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            // Allow trainer_id to be null so instructors can be deleted without cascading to classes
            jdbcTemplate.execute(
                "ALTER TABLE workout_classes MODIFY COLUMN trainer_id VARCHAR(255) NULL"
            );
        } catch (Exception e) {
            // Column already nullable or table doesn't exist yet — safe to ignore
        }
    }
}
