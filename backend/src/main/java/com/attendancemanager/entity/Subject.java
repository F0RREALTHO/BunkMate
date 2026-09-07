package com.attendancemanager.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "subjects", indexes = {
    @Index(name = "idx_subjects_user_id", columnList = "user_id")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 30)
    private String code;

    @Column(name = "required_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal requiredPercentage = new BigDecimal("75.00");

    @Column(name = "attended_classes", nullable = false)
    @Builder.Default
    private Integer attendedClasses = 0;

    @Column(name = "total_classes", nullable = false)
    @Builder.Default
    private Integer totalClasses = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Integer version = 0;
}
