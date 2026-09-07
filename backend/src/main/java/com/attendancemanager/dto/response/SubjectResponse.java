package com.attendancemanager.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data @Builder @AllArgsConstructor
public class SubjectResponse {
    private Long id;
    private String name;
    private String code;
    private BigDecimal requiredPercentage;
    private Integer attendedClasses;
    private Integer totalClasses;
    private BigDecimal attendancePercentage;
    private Integer classesCanSkip;
    private Integer classesNeeded;
    private String status; // SAFE, WARNING, DANGER
    private String statusMessage;
    private Instant createdAt;
    private Instant updatedAt;
}
