package com.attendancemanager.service;

import com.attendancemanager.dto.request.AttendanceRequest;
import com.attendancemanager.dto.response.AttendanceRecordResponse;
import com.attendancemanager.dto.response.SubjectResponse;
import com.attendancemanager.entity.AttendanceRecord;
import com.attendancemanager.entity.AttendanceRecord.AttendanceStatus;
import com.attendancemanager.exception.RateLimitExceededException;
import com.attendancemanager.exception.ResourceNotFoundException;
import com.attendancemanager.ratelimit.RateLimiter;
import com.attendancemanager.repository.AttendanceRecordRepository;
import com.attendancemanager.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository recordRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectService subjectService;
    private final RateLimiter rateLimiter;

    @Value("${app.rate-limit.user.max-requests:20}")
    private int userMaxRequests;

    @Value("${app.rate-limit.user.window-seconds:60}")
    private int userWindowSeconds;

    @Value("${app.rate-limit.subject.max-requests:5}")
    private int subjectMaxRequests;

    @Value("${app.rate-limit.subject.window-seconds:10}")
    private int subjectWindowSeconds;

    @Transactional
    public SubjectResponse recordAttendance(Long subjectId, Long userId, AttendanceRequest request) {
        // Rate limit checks
        checkRateLimits(subjectId, userId);

        // Ownership check
        subjectService.findOwnedSubject(subjectId, userId);

        // Idempotency check
        Optional<AttendanceRecord> existing = recordRepository.findByIdempotencyKey(request.getIdempotencyKey());
        if (existing.isPresent()) {
            // Return current subject state without re-processing
            return subjectService.getSubject(subjectId, userId);
        }

        AttendanceStatus status = AttendanceStatus.valueOf(request.getStatus());

        // Create attendance record (historical truth)
        AttendanceRecord record = AttendanceRecord.builder()
                .subjectId(subjectId)
                .userId(userId)
                .status(status)
                .idempotencyKey(request.getIdempotencyKey())
                .build();
        recordRepository.save(record);

        // Atomic counter updates — no read-modify-write race
        int updated;
        if (status == AttendanceStatus.PRESENT) {
            updated = subjectRepository.incrementAttendedAndTotal(subjectId, userId);
        } else {
            updated = subjectRepository.incrementTotalOnly(subjectId, userId);
        }

        if (updated == 0) {
            throw new ResourceNotFoundException("Subject not found or update failed");
        }

        return subjectService.getSubject(subjectId, userId);
    }

    @Transactional
    public SubjectResponse undoAttendance(Long subjectId, Long recordId, Long userId) {
        // Ownership check
        subjectService.findOwnedSubject(subjectId, userId);

        AttendanceRecord record = recordRepository.findByIdAndUserId(recordId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));

        if (!record.getSubjectId().equals(subjectId)) {
            throw new ResourceNotFoundException("Record does not belong to this subject");
        }

        // Reverse the counter update
        int updated;
        if (record.getStatus() == AttendanceStatus.PRESENT) {
            updated = subjectRepository.decrementAttendedAndTotal(subjectId, userId);
        } else {
            updated = subjectRepository.decrementTotalOnly(subjectId, userId);
        }

        if (updated == 0) {
            throw new IllegalArgumentException("Cannot undo: attendance counters at minimum");
        }

        // Delete the record
        recordRepository.delete(record);

        return subjectService.getSubject(subjectId, userId);
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> getHistory(Long subjectId, Long userId) {
        subjectService.findOwnedSubject(subjectId, userId);
        return recordRepository.findBySubjectIdAndUserIdOrderByOccurredAtDesc(subjectId, userId)
                .stream()
                .map(r -> AttendanceRecordResponse.builder()
                        .id(r.getId())
                        .subjectId(r.getSubjectId())
                        .status(r.getStatus().name())
                        .occurredAt(r.getOccurredAt())
                        .idempotencyKey(r.getIdempotencyKey())
                        .build())
                .toList();
    }

    private void checkRateLimits(Long subjectId, Long userId) {
        String userKey = "user:" + userId;
        if (!rateLimiter.tryAcquire(userKey, userMaxRequests, Duration.ofSeconds(userWindowSeconds))) {
            throw new RateLimitExceededException("Too many attendance updates. Please wait a moment.");
        }

        String subjectKey = "subject:" + subjectId;
        if (!rateLimiter.tryAcquire(subjectKey, subjectMaxRequests, Duration.ofSeconds(subjectWindowSeconds))) {
            throw new RateLimitExceededException("Too many updates for this subject. Please wait a moment.");
        }
    }
}
