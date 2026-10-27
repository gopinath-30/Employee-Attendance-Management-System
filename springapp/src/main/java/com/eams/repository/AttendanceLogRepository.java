package com.eams.repository;

import com.eams.entity.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {
    Optional<AttendanceLog> findByUserIdAndAttendanceDate(Long userId, LocalDate date);
    List<AttendanceLog> findByUserIdAndAttendanceDateBetweenOrderByAttendanceDateAsc(
            Long userId, LocalDate start, LocalDate end);
    List<AttendanceLog> findByUserIdOrderByAttendanceDateDesc(Long userId);
    List<AttendanceLog> findByAttendanceDate(LocalDate date);
    List<AttendanceLog> findByUserIdInAndAttendanceDate(List<Long> userIds, LocalDate date);
}
