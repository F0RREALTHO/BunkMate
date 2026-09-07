package com.attendancemanager.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Centralized attendance calculation logic.
 * All formulas live here — prevents frontend/backend divergence.
 */
public final class AttendanceCalculator {

    private AttendanceCalculator() {}

    /**
     * attendance = attended / total × 100
     * Returns null if total == 0
     */
    public static BigDecimal calculatePercentage(int attended, int total) {
        if (total == 0) return null;
        return BigDecimal.valueOf(attended)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP);
    }

    /**
     * Largest integer X such that attended / (total + X) >= required / 100
     *
     * Rearranged: X <= attended / (required/100) - total
     *           = (attended * 100) / required - total
     *
     * Uses integer-safe math: floor(attended * 100 / required) - total
     */
    public static int calculateClassesCanSkip(int attended, int total, BigDecimal requiredPercentage) {
        if (requiredPercentage.compareTo(BigDecimal.ZERO) <= 0) return Integer.MAX_VALUE;
        if (requiredPercentage.compareTo(BigDecimal.valueOf(100)) >= 0) return 0;
        if (total == 0) return 0;

        // Check if currently below requirement
        BigDecimal currentPct = calculatePercentage(attended, total);
        if (currentPct != null && currentPct.compareTo(requiredPercentage) < 0) {
            return 0;
        }

        // X <= (attended * 100) / required - total
        // Use integer-safe floor division
        long numerator = (long) attended * 100;
        long denominator = requiredPercentage.longValue();
        if (denominator == 0) return Integer.MAX_VALUE;

        long maxTotal = numerator / denominator;  // floor division
        long canSkip = maxTotal - total;

        return (int) Math.max(0, canSkip);
    }

    /**
     * Smallest integer X such that (attended + X) / (total + X) >= required / 100
     *
     * Rearranged: X >= (required * total - attended * 100) / (100 - required)
     *
     * If required == 100%, recovery is impossible (unless already perfect).
     * If currently at or above requirement, returns 0.
     */
    public static int calculateClassesNeeded(int attended, int total, BigDecimal requiredPercentage) {
        if (requiredPercentage.compareTo(BigDecimal.ZERO) <= 0) return 0;
        if (total == 0) return 0;

        BigDecimal currentPct = calculatePercentage(attended, total);
        if (currentPct != null && currentPct.compareTo(requiredPercentage) >= 0) {
            return 0;
        }

        if (requiredPercentage.compareTo(BigDecimal.valueOf(100)) >= 0) {
            // 100% required: impossible to recover if any class missed
            return (attended == total) ? 0 : -1;
        }

        // X >= (R * T - A * 100) / (100 - R)
        double R = requiredPercentage.doubleValue();
        double needed = (R * total - attended * 100.0) / (100.0 - R);

        return Math.max(0, (int) Math.ceil(needed));
    }

    /**
     * Determine status: SAFE, WARNING, or DANGER
     *
     * DANGER:  below requirement
     * WARNING: 0-5% above requirement
     * SAFE:    >5% above requirement or no classes recorded
     */
    public static String calculateStatus(int attended, int total, BigDecimal requiredPercentage) {
        if (total == 0) return "SAFE";
        BigDecimal pct = calculatePercentage(attended, total);
        if (pct == null) return "SAFE";

        BigDecimal diff = pct.subtract(requiredPercentage);
        if (diff.compareTo(BigDecimal.ZERO) < 0) return "DANGER";
        if (diff.compareTo(BigDecimal.valueOf(5)) <= 0) return "WARNING";
        return "SAFE";
    }

    /**
     * Generate human-readable status message
     */
    public static String statusMessage(int canSkip, int classesNeeded, String status, BigDecimal requiredPercentage) {
        if (status.equals("DANGER")) {
            if (classesNeeded == -1) {
                return "Recovery not possible at " + requiredPercentage.stripTrailingZeros().toPlainString() + "%";
            }
            return "Attend " + classesNeeded + " more class" + (classesNeeded != 1 ? "es" : "") +
                   " to reach " + requiredPercentage.stripTrailingZeros().toPlainString() + "%";
        }
        if (canSkip == 0) {
            return "Don't skip another class";
        }
        if (canSkip == Integer.MAX_VALUE) {
            return "No attendance requirement";
        }
        return "You can skip " + canSkip + " class" + (canSkip != 1 ? "es" : "");
    }
}
