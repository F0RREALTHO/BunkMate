package com.attendancemanager.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @AllArgsConstructor
public class DashboardResponse {
    private String userName;
    private BigDecimal overallPercentage;
    private Integer totalAttended;
    private Integer totalClasses;
    private List<SubjectResponse> subjects;
}
