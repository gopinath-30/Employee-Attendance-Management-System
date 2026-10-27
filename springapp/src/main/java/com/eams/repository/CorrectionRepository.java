package com.eams.repository;

import com.eams.entity.Correction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CorrectionRepository extends JpaRepository<Correction, Long> {
    List<Correction> findByAttendanceLogIdOrderByTimestampDesc(Long attendanceLogId);
}
