// package com.eams.service;

// import com.eams.dto.AttendanceResponse;
// import com.eams.dto.CorrectionRequest;
// import com.eams.entity.AttendanceLog;
// import com.eams.entity.Correction;
// import com.eams.entity.Role;
// import com.eams.entity.User;
// import com.eams.exception.BadRequestException;
// import com.eams.exception.ResourceNotFoundException;
// import com.eams.exception.UnauthorizedException;
// import com.eams.repository.AttendanceLogRepository;
// import com.eams.repository.CorrectionRepository;
// import com.eams.repository.UserRepository;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.LocalDateTime;

// @Service
// public class CorrectionService {

//     private final AttendanceLogRepository attendanceLogRepository;
//     private final CorrectionRepository correctionRepository;
//     private final UserRepository userRepository;
//     private final AttendanceCalculator calculator;
//     private final AttendanceService attendanceService;
//     private final NotificationService notificationService;

//     public CorrectionService(AttendanceLogRepository attendanceLogRepository,
//                               CorrectionRepository correctionRepository,
//                               UserRepository userRepository,
//                               AttendanceCalculator calculator,
//                               AttendanceService attendanceService,
//                               NotificationService notificationService) {
//         this.attendanceLogRepository = attendanceLogRepository;
//         this.correctionRepository = correctionRepository;
//         this.userRepository = userRepository;
//         this.calculator = calculator;
//         this.attendanceService = attendanceService;
//         this.notificationService = notificationService;
//     }

//     @Transactional
//     public AttendanceResponse correctAttendance(CorrectionRequest request, User actingUser) {
//         User targetUser = userRepository.findByEmployeeId(request.getEmployeeId())
//                 .orElseThrow(() -> new ResourceNotFoundException("Employee not found with employeeId " + request.getEmployeeId()));

//         // Enforce RBAC: managers may only correct their direct reports; admins may correct anyone.
//         if (actingUser.getRole() == Role.MANAGER) {
//             if (targetUser.getManager() == null || !targetUser.getManager().getId().equals(actingUser.getId())) {
//                 throw new UnauthorizedException("You may only correct attendance for your direct reports");
//             }
//         } else if (actingUser.getRole() != Role.ADMIN) {
//             throw new UnauthorizedException("You are not permitted to correct attendance records");
//         }

//         AttendanceLog log = attendanceLogRepository.findByUserIdAndAttendanceDate(targetUser.getId(), request.getDate())
//                 .orElseThrow(() -> new ResourceNotFoundException("No attendance record found for " + request.getEmployeeId() + " on " + request.getDate()));

//         LocalDateTime oldCheckIn = log.getCheckInTime();
//         LocalDateTime oldCheckOut = log.getCheckOutTime();

//         LocalDateTime newCheckIn = request.getNewCheckInTime() != null ? request.getNewCheckInTime() : oldCheckIn;
//         LocalDateTime newCheckOut = request.getNewCheckOutTime() != null ? request.getNewCheckOutTime() : oldCheckOut;

//         if (newCheckIn == null) {
//             throw new BadRequestException("A check-in time is required");
//         }
//         if (newCheckOut != null && !newCheckOut.isAfter(newCheckIn)) {
//             throw new BadRequestException("Checkout time must be after check-in time");
//         }

//         log.setCheckInTime(newCheckIn);
//         log.setCheckOutTime(newCheckOut);

//         if (newCheckOut != null) {
//             double hours = calculator.calculateWorkHours(newCheckIn, newCheckOut);
//             log.setTotalHours(hours);
//             log.setStatus(calculator.calculateStatus(hours));
//         }
//         log.setCorrected(true);

//         log = attendanceLogRepository.save(log);

//         Correction correction = Correction.builder()
//                 .attendanceLog(log)
//                 .correctedBy(actingUser)
//                 .reason(request.getReason())
//                 .oldCheckIn(oldCheckIn)
//                 .newCheckIn(newCheckIn)
//                 .oldCheckOut(oldCheckOut)
//                 .newCheckOut(newCheckOut)
//                 .timestamp(LocalDateTime.now())
//                 .build();
//         correctionRepository.save(correction);

//         notificationService.notify(targetUser,
//                 "Your attendance for " + request.getDate() + " was corrected by " + actingUser.getName() +
//                         (request.getReason() != null ? (": " + request.getReason()) : ""));

//         return attendanceService.toResponse(log);
//     }
// }




























package com.eams.service;

import com.eams.dto.AttendanceResponse;
import com.eams.dto.CorrectionRequest;
import com.eams.entity.AttendanceLog;
import com.eams.entity.Correction;
import com.eams.entity.Role;
import com.eams.entity.User;
import com.eams.exception.BadRequestException;
import com.eams.exception.ResourceNotFoundException;
import com.eams.exception.UnauthorizedException;
import com.eams.repository.AttendanceLogRepository;
import com.eams.repository.CorrectionRepository;
import com.eams.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CorrectionService {

    private final AttendanceLogRepository attendanceLogRepository;
    private final CorrectionRepository correctionRepository;
    private final UserRepository userRepository;
    private final AttendanceCalculator calculator;
    private final AttendanceService attendanceService;
    private final NotificationService notificationService;

    public CorrectionService(
            AttendanceLogRepository attendanceLogRepository,
            CorrectionRepository correctionRepository,
            UserRepository userRepository,
            AttendanceCalculator calculator,
            AttendanceService attendanceService,
            NotificationService notificationService) {

        this.attendanceLogRepository = attendanceLogRepository;
        this.correctionRepository = correctionRepository;
        this.userRepository = userRepository;
        this.calculator = calculator;
        this.attendanceService = attendanceService;
        this.notificationService = notificationService;
    }

    @Transactional
    public AttendanceResponse correctAttendance(
            CorrectionRequest request,
            User actingUser) {

        User targetUser =
                userRepository
                        .findByEmployeeId(request.getEmployeeId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found with employeeId "
                                                + request.getEmployeeId()
                                )
                        );

        /*
         * ================================
         * CORRECTION AUTHORIZATION
         * ================================
         *
         * ADMIN:
         *   Can correct Employee and Manager attendance.
         *
         * MANAGER:
         *   Can correct only direct-report EMPLOYEES.
         *   Cannot correct themselves.
         *   Cannot correct another MANAGER.
         *
         * EMPLOYEE:
         *   Cannot correct attendance.
         */

        if (actingUser.getRole() == Role.ADMIN) {

            // Admin has full correction authority.

        } else if (actingUser.getRole() == Role.MANAGER) {

            // Manager cannot correct themselves.
            if (actingUser.getId().equals(targetUser.getId())) {
                throw new UnauthorizedException(
                        "Managers cannot modify their own attendance. "
                                + "Only Admin can modify manager attendance."
                );
            }

            // Manager cannot modify another Manager.
            if (targetUser.getRole() == Role.MANAGER) {
                throw new UnauthorizedException(
                        "Managers cannot modify manager attendance. "
                                + "Only Admin can modify manager attendance."
                );
            }

            // Manager can modify only direct-report employees.
            if (targetUser.getManager() == null
                    || !targetUser.getManager()
                            .getId()
                            .equals(actingUser.getId())) {

                throw new UnauthorizedException(
                        "You may only modify attendance for your direct-report employees"
                );
            }

        } else {

            throw new UnauthorizedException(
                    "You are not permitted to correct attendance records"
            );
        }

        /*
         * ================================
         * FIND ATTENDANCE RECORD
         * ================================
         */

        AttendanceLog log =
                attendanceLogRepository
                        .findByUserIdAndAttendanceDate(
                                targetUser.getId(),
                                request.getDate()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No attendance record found for "
                                                + request.getEmployeeId()
                                                + " on "
                                                + request.getDate()
                                )
                        );

        LocalDateTime oldCheckIn =
                log.getCheckInTime();

        LocalDateTime oldCheckOut =
                log.getCheckOutTime();

        LocalDateTime newCheckIn =
                request.getNewCheckInTime() != null
                        ? request.getNewCheckInTime()
                        : oldCheckIn;

        LocalDateTime newCheckOut =
                request.getNewCheckOutTime() != null
                        ? request.getNewCheckOutTime()
                        : oldCheckOut;

        if (newCheckIn == null) {
            throw new BadRequestException(
                    "A check-in time is required"
            );
        }

        if (newCheckOut != null
                && !newCheckOut.isAfter(newCheckIn)) {

            throw new BadRequestException(
                    "Checkout time must be after check-in time"
            );
        }

        /*
         * ================================
         * UPDATE ATTENDANCE
         * ================================
         */

        log.setCheckInTime(newCheckIn);
        log.setCheckOutTime(newCheckOut);

        if (newCheckOut != null) {

            double hours =
                    calculator.calculateWorkHours(
                            newCheckIn,
                            newCheckOut
                    );

            log.setTotalHours(hours);
            log.setStatus(
                    calculator.calculateStatus(hours)
            );

        } else {

            // Still checked in / incomplete attendance.
            log.setTotalHours(null);
            log.setStatus(
                    com.eams.entity.AttendanceStatus.IN_PROGRESS
            );
        }

        log.setCorrected(true);

        log =
                attendanceLogRepository.save(log);

        /*
         * ================================
         * SAVE CORRECTION HISTORY
         * ================================
         */

        Correction correction =
                Correction.builder()
                        .attendanceLog(log)
                        .correctedBy(actingUser)
                        .reason(request.getReason())
                        .oldCheckIn(oldCheckIn)
                        .newCheckIn(newCheckIn)
                        .oldCheckOut(oldCheckOut)
                        .newCheckOut(newCheckOut)
                        .timestamp(LocalDateTime.now())
                        .build();

        correctionRepository.save(correction);

        /*
         * ================================
         * NOTIFY TARGET USER
         * ================================
         */

        notificationService.notify(
                targetUser,
                "Your attendance for "
                        + request.getDate()
                        + " was corrected by "
                        + actingUser.getName()
                        + (
                            request.getReason() != null
                            && !request.getReason().isBlank()
                                ? ": " + request.getReason()
                                : ""
                        )
        );

        return attendanceService.toResponse(log);
    }
}
