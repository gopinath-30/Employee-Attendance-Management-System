package com.eams.controller;

import com.eams.dto.AttendanceResponse;
import com.eams.dto.CorrectionRequest;
import com.eams.entity.User;
import com.eams.security.CurrentUserProvider;
import com.eams.service.CorrectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/corrections")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class CorrectionController {

    private final CorrectionService correctionService;
    private final CurrentUserProvider currentUserProvider;

    public CorrectionController(CorrectionService correctionService, CurrentUserProvider currentUserProvider) {
        this.correctionService = correctionService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping
    public ResponseEntity<AttendanceResponse> correctAttendance(@Valid @RequestBody CorrectionRequest request) {
        User actingUser = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(correctionService.correctAttendance(request, actingUser));
    }
}
