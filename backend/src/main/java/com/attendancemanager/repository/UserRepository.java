package com.attendancemanager.repository;

import com.attendancemanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleSubjectId(String googleSubjectId);
    boolean existsByEmail(String email);
}
