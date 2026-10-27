package com.eams.controller;

import com.eams.dto.EmployeeResponse;
import com.eams.dto.UserUpdateRequest;
import com.eams.security.CurrentUserProvider;
import com.eams.service.UserManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserManagementService userManagementService;
    private final CurrentUserProvider currentUserProvider;

    public UserController(UserManagementService userManagementService, CurrentUserProvider currentUserProvider) {
        this.userManagementService = userManagementService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmployeeResponse>> getAllUsers() {
        return ResponseEntity.ok(userManagementService.getAllUsers());
    }

    @GetMapping("/team")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<EmployeeResponse>> getMyTeam() {
        Long managerId = currentUserProvider.getCurrentUser().getId();
        return ResponseEntity.ok(userManagementService.getTeamMembers(managerId));
    }

    @PutMapping("/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponse> updateUser(@PathVariable String employeeId,
                                                        @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userManagementService.updateUser(employeeId, request));
    }

    @PutMapping("/{employeeId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponse> deactivateUser(@PathVariable String employeeId) {
        return ResponseEntity.ok(userManagementService.deactivateUser(employeeId));
    }
}
