package com.eams.controller;

import com.eams.dto.ChangePasswordRequest;
import com.eams.dto.EmployeeResponse;
import com.eams.dto.ProfileUpdateRequest;
import com.eams.entity.User;
import com.eams.security.CurrentUserProvider;
import com.eams.service.EmployeeService;
import com.eams.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final CurrentUserProvider currentUserProvider;
    private final EmployeeService employeeService;

    public ProfileController(ProfileService profileService, CurrentUserProvider currentUserProvider, EmployeeService employeeService) {
        this.profileService = profileService;
        this.currentUserProvider = currentUserProvider;
        this.employeeService = employeeService;
    }

    @GetMapping
    public ResponseEntity<EmployeeResponse> getProfile() {
        User user = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(employeeService.toResponse(user));
    }

    @PutMapping
    public ResponseEntity<EmployeeResponse> updateProfile(@RequestBody ProfileUpdateRequest request) {
        User user = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(profileService.updateProfile(user, request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = currentUserProvider.getCurrentUser();
        profileService.changePassword(user, request);
        return ResponseEntity.ok().build();
    }
}
