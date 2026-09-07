package com.attendancemanager.repository;

import com.attendancemanager.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    List<Subject> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Subject> findByIdAndUserId(Long id, Long userId);

    @Modifying
    @Query("UPDATE Subject s SET s.attendedClasses = s.attendedClasses + 1, " +
           "s.totalClasses = s.totalClasses + 1, s.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE s.id = :id AND s.userId = :userId")
    int incrementAttendedAndTotal(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Subject s SET s.totalClasses = s.totalClasses + 1, " +
           "s.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE s.id = :id AND s.userId = :userId")
    int incrementTotalOnly(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Subject s SET s.attendedClasses = s.attendedClasses - 1, " +
           "s.totalClasses = s.totalClasses - 1, s.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE s.id = :id AND s.userId = :userId AND s.attendedClasses > 0 AND s.totalClasses > 0")
    int decrementAttendedAndTotal(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Subject s SET s.totalClasses = s.totalClasses - 1, " +
           "s.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE s.id = :id AND s.userId = :userId AND s.totalClasses > 0")
    int decrementTotalOnly(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Subject s SET s.attendedClasses = 0, s.totalClasses = 0, " +
           "s.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE s.id = :id AND s.userId = :userId")
    int resetCounters(@Param("id") Long id, @Param("userId") Long userId);
}
