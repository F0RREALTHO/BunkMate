package com.attendancemanager.repository;

import com.attendancemanager.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    Optional<AttendanceRecord> findByIdempotencyKey(String idempotencyKey);

    List<AttendanceRecord> findBySubjectIdAndUserIdOrderByOccurredAtDesc(Long subjectId, Long userId);

    Optional<AttendanceRecord> findFirstBySubjectIdAndUserIdAndStatusOrderByOccurredAtDesc(Long subjectId, Long userId, AttendanceRecord.AttendanceStatus status);

    Optional<AttendanceRecord> findByIdAndUserId(Long id, Long userId);

    void deleteBySubjectId(Long subjectId);

    List<AttendanceRecord> findByUserIdOrderByOccurredAtDesc(Long userId);
}
