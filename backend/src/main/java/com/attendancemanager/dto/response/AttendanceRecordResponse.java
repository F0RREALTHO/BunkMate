package com.attendancemanager.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data @Builder @AllArgsConstructor
public class AttendanceRecordResponse {
    private Long id;
    private Long subjectId;
    private String subjectName;
    private String status;
    private Instant occurredAt;
    private String idempotencyKey;
}
