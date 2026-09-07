package com.attendancemanager.service;

import com.attendancemanager.dto.request.CreateSubjectRequest;
import com.attendancemanager.dto.request.UpdateSubjectRequest;
import com.attendancemanager.dto.response.DashboardResponse;
import com.attendancemanager.dto.response.SubjectResponse;
import com.attendancemanager.entity.Subject;
import com.attendancemanager.entity.User;
import com.attendancemanager.exception.ResourceNotFoundException;
import com.attendancemanager.repository.AttendanceRecordRepository;
import com.attendancemanager.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long userId) {
        User user = authService.getUserById(userId);
        List<Subject> subjects = subjectRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<SubjectResponse> responses = subjects.stream().map(this::toResponse).toList();

        int totalAttended = subjects.stream().mapToInt(Subject::getAttendedClasses).sum();
        int totalClasses = subjects.stream().mapToInt(Subject::getTotalClasses).sum();
        BigDecimal overallPct = totalClasses > 0
                ? BigDecimal.valueOf(totalAttended)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalClasses), 1, RoundingMode.HALF_UP)
                : null;

        return DashboardResponse.builder()
                .userName(user.getName())
                .overallPercentage(overallPct)
                .totalAttended(totalAttended)
                .totalClasses(totalClasses)
                .subjects(responses)
                .build();
    }

    @Transactional
    public SubjectResponse createSubject(Long userId, CreateSubjectRequest request) {
        Subject subject = Subject.builder()
                .userId(userId)
                .name(request.getName().trim())
                .code(request.getCode() != null ? request.getCode().trim() : null)
                .requiredPercentage(request.getRequiredPercentage())
                .build();
        subject = subjectRepository.save(subject);
        return toResponse(subject);
    }

    @Transactional(readOnly = true)
    public SubjectResponse getSubject(Long subjectId, Long userId) {
        Subject subject = findOwnedSubject(subjectId, userId);
        return toResponse(subject);
    }

    @Transactional
    public SubjectResponse updateSubject(Long subjectId, Long userId, UpdateSubjectRequest request) {
        Subject subject = findOwnedSubject(subjectId, userId);
        subject.setName(request.getName().trim());
        subject.setCode(request.getCode() != null ? request.getCode().trim() : null);
        if (request.getRequiredPercentage() != null) {
            subject.setRequiredPercentage(request.getRequiredPercentage());
        }
        subject = subjectRepository.save(subject);
        return toResponse(subject);
    }

    @Transactional
    public void deleteSubject(Long subjectId, Long userId) {
        Subject subject = findOwnedSubject(subjectId, userId);
        attendanceRecordRepository.deleteBySubjectId(subjectId);
        subjectRepository.delete(subject);
    }

    @Transactional
    public SubjectResponse resetSubject(Long subjectId, Long userId) {
        findOwnedSubject(subjectId, userId); // ownership check
        subjectRepository.resetCounters(subjectId, userId);
        attendanceRecordRepository.deleteBySubjectId(subjectId);
        Subject subject = subjectRepository.findByIdAndUserId(subjectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        return toResponse(subject);
    }

    public Subject findOwnedSubject(Long subjectId, Long userId) {
        return subjectRepository.findByIdAndUserId(subjectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
    }

    private SubjectResponse toResponse(Subject s) {
        int attended = s.getAttendedClasses();
        int total = s.getTotalClasses();
        BigDecimal reqPct = s.getRequiredPercentage();

        BigDecimal pct = AttendanceCalculator.calculatePercentage(attended, total);
        int canSkip = AttendanceCalculator.calculateClassesCanSkip(attended, total, reqPct);
        int needed = AttendanceCalculator.calculateClassesNeeded(attended, total, reqPct);
        String status = AttendanceCalculator.calculateStatus(attended, total, reqPct);
        String message = AttendanceCalculator.statusMessage(canSkip, needed, status, reqPct);

        return SubjectResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .code(s.getCode())
                .requiredPercentage(reqPct)
                .attendedClasses(attended)
                .totalClasses(total)
                .attendancePercentage(pct)
                .classesCanSkip(canSkip)
                .classesNeeded(needed)
                .status(status)
                .statusMessage(message)
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
