package com.attendancemanager.controller;

import com.attendancemanager.dto.request.AttendanceRequest;
import com.attendancemanager.dto.request.CreateSubjectRequest;
import com.attendancemanager.dto.request.UpdateSubjectRequest;
import com.attendancemanager.dto.response.AttendanceRecordResponse;
import com.attendancemanager.dto.response.DashboardResponse;
import com.attendancemanager.dto.response.SubjectResponse;
import com.attendancemanager.service.AttendanceService;
import com.attendancemanager.service.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;
    private final AttendanceService attendanceService;

    private Long getUserId(Authentication auth) {
        return (Long) auth.getPrincipal();
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> dashboard(Authentication auth) {
        return ResponseEntity.ok(subjectService.getDashboard(getUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<SubjectResponse> create(Authentication auth,
            @Valid @RequestBody CreateSubjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subjectService.createSubject(getUserId(auth), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectResponse> get(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getSubject(id, getUserId(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectResponse> update(Authentication auth, @PathVariable Long id,
            @Valid @RequestBody UpdateSubjectRequest request) {
        return ResponseEntity.ok(subjectService.updateSubject(id, getUserId(auth), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
        subjectService.deleteSubject(id, getUserId(auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/attendance")
    public ResponseEntity<SubjectResponse> recordAttendance(Authentication auth,
            @PathVariable Long id, @Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.recordAttendance(id, getUserId(auth), request));
    }

    @DeleteMapping("/{id}/attendance/{recordId}")
    public ResponseEntity<SubjectResponse> undoAttendance(Authentication auth,
            @PathVariable Long id, @PathVariable Long recordId) {
        return ResponseEntity.ok(attendanceService.undoAttendance(id, recordId, getUserId(auth)));
    }

    @GetMapping("/{id}/attendance")
    public ResponseEntity<List<AttendanceRecordResponse>> history(Authentication auth,
            @PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getHistory(id, getUserId(auth)));
    }

    @PostMapping("/{id}/reset")
    public ResponseEntity<SubjectResponse> reset(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(subjectService.resetSubject(id, getUserId(auth)));
    }
}
