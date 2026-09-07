package com.attendancemanager.ratelimit;

import org.springframework.stereotype.Component;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Sliding window rate limiter backed by in-memory data structures.
 * Thread-safe via ConcurrentHashMap + ConcurrentLinkedDeque.
 *
 * For multi-instance scaling, replace with a Redis-backed implementation
 * using the same RateLimiter interface (e.g., Redis sorted sets with ZRANGEBYSCORE).
 */
@Component
public class InMemoryRateLimiter implements RateLimiter {

    private final ConcurrentHashMap<String, ConcurrentLinkedDeque<Instant>> windows = new ConcurrentHashMap<>();

    @Override
    public boolean tryAcquire(String key, int maxRequests, Duration window) {
        ConcurrentLinkedDeque<Instant> timestamps = windows.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());
        Instant now = Instant.now();
        Instant cutoff = now.minus(window);

        // Evict expired entries
        while (!timestamps.isEmpty() && timestamps.peekFirst() != null && timestamps.peekFirst().isBefore(cutoff)) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= maxRequests) {
            return false;
        }

        timestamps.addLast(now);
        return true;
    }
}
