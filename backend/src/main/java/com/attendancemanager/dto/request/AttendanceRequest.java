package com.attendancemanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AttendanceRequest {
    @NotNull(message = "Status is required")
    @Pattern(regexp = "PRESENT|ABSENT", message = "Status must be PRESENT or ABSENT")
    private String status;

    @NotBlank(message = "Idempotency key is required")
    private String idempotencyKey;
}
