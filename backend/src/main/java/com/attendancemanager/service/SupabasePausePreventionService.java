package com.attendancemanager.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

/**
 * Supabase Pause Prevention Service
 *
 * Prevents the Supabase free-tier project from being paused due to inactivity
 * by periodically executing a lightweight, no-op database query.
 *
 * Free-tier Supabase projects are paused after 7 days of inactivity.
 * This service runs on a configurable cron schedule (default: every 3 days)
 * to keep the project active.
 *
 * Inspired by: https://github.com/travisvn/supabase-pause-prevention
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.supabase-pause-prevention.enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class SupabasePausePreventionService {

    private final JdbcTemplate jdbcTemplate;
    private static final Random RANDOM = new Random();
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Scheduled keep-alive ping.
     *
     * Default cron: "0 0 5 * * MON,WED,FRI" (5:00 AM on Mon, Wed, Fri)
     * This matches the original project's schedule: "0 5 * * 0,3,5"
     *
     * Configurable via: app.supabase-pause-prevention.cron
     */
    @Scheduled(cron = "${app.supabase-pause-prevention.cron:0 0 5 * * MON,WED,FRI}")
    public void keepAlive() {
        String randomString = generateRandomString(12);
        String timestamp = LocalDateTime.now().format(FORMATTER);

        log.info("[Supabase Keep-Alive] Pinging database at {} with token '{}'", timestamp, randomString);

        try {
            // Execute a lightweight SELECT 1 — the simplest possible DB ping
            // This is enough to mark the project as active in Supabase
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            log.info("[Supabase Keep-Alive] ✅ Database ping successful at {}", timestamp);

        } catch (Exception e) {
            log.error("[Supabase Keep-Alive] ❌ Database ping failed at {}: {}", timestamp, e.getMessage(), e);
        }
    }

    /**
     * Generates a random lowercase alphabetic string.
     * Mirrors the behaviour of the original TypeScript implementation.
     */
    private String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append((char) ('a' + RANDOM.nextInt(26)));
        }
        return sb.toString();
    }
}
