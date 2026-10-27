package com.eams.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "corrections")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Correction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attendance_log_id", nullable = false)
    private AttendanceLog attendanceLog;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "corrected_by_user_id", nullable = false)
    private User correctedBy;

    @Column(nullable = false)
    private String reason;

    private LocalDateTime oldCheckIn;
    private LocalDateTime newCheckIn;
    private LocalDateTime oldCheckOut;
    private LocalDateTime newCheckOut;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
