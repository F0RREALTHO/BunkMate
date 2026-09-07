package com.attendancemanager.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            // Safely drop NOT NULL constraint for password_hash to allow Google OAuth users
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;");
        } catch (Exception e) {
            // Ignore if column doesn't exist yet or if constraint is already dropped
            System.out.println("Migration note: " + e.getMessage());
        }
    }
}
