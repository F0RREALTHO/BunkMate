package com.attendancemanager.ratelimit;

import java.time.Duration;

/**
 * Rate limiter interface. MVP uses in-memory implementation.
 * For multi-instance deployments, swap to RedisRateLimiter.
 */
public interface RateLimiter {
    boolean tryAcquire(String key, int maxRequests, Duration window);
}
