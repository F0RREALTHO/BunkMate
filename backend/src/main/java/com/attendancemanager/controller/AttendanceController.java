package com.attendancemanager.controller;

import com.attendancemanager.dto.response.AttendanceRecordResponse;
import com.attendancemanager.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    private Long getUserId(Authentication auth) {
        return (Long) auth.getPrincipal();
    }

    @GetMapping
    public ResponseEntity<List<AttendanceRecordResponse>> getAllHistory(Authentication auth) {
        return ResponseEntity.ok(attendanceService.getAllHistory(getUserId(auth)));
    }
}
