package com.attendancemanager.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateSubjectRequest {
    @NotBlank(message = "Subject name is required")
    @Size(max = 150, message = "Subject name must be at most 150 characters")
    private String name;

    @Size(max = 30, message = "Subject code must be at most 30 characters")
    private String code;

    @DecimalMin(value = "0.0", message = "Required percentage must be at least 0")
    @DecimalMax(value = "100.0", message = "Required percentage must be at most 100")
    private BigDecimal requiredPercentage = new BigDecimal("75.00");

    @Min(value = 0, message = "Attended classes cannot be negative")
    private Integer attendedClasses = 0;

    @Min(value = 0, message = "Total classes cannot be negative")
    private Integer totalClasses = 0;
}
