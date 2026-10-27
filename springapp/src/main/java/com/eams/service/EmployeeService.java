
package com.eams.service;

import com.eams.dto.EmployeeCreateRequest;
import com.eams.dto.EmployeeResponse;
import com.eams.entity.Role;
import com.eams.entity.User;
import com.eams.exception.BadRequestException;
import com.eams.exception.ConflictException;
import com.eams.exception.ResourceNotFoundException;
import com.eams.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmployeeService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public EmployeeResponse createEmployee(
            EmployeeCreateRequest request) {

        // Check employee ID
        if (userRepository.existsByEmployeeId(
                request.getEmployeeId())) {

            throw new ConflictException(
                    "An employee with employeeId "
                            + request.getEmployeeId()
                            + " already exists"
            );
        }

        // Check email
        if (userRepository.existsByEmail(
                request.getEmail())) {

            throw new ConflictException(
                    "An employee with email "
                            + request.getEmail()
                            + " already exists"
            );
        }

        // Determine role
        Role role = Role.EMPLOYEE;

        if (request.getRole() != null
                && !request.getRole().isBlank()) {

            try {

                role = Role.valueOf(
                        request.getRole()
                                .trim()
                                .toUpperCase()
                );

            } catch (IllegalArgumentException ex) {

                throw new BadRequestException(
                        "Invalid role: "
                                + request.getRole()
                );
            }
        }

        // Find manager
        User manager = null;

        if (request.getManagerEmployeeId() != null
                && !request.getManagerEmployeeId().isBlank()) {

            String managerEmployeeId =
                    request.getManagerEmployeeId().trim();

            // Employee cannot be their own manager
            if (managerEmployeeId.equalsIgnoreCase(
                    request.getEmployeeId())) {

                throw new BadRequestException(
                        "An employee cannot be assigned as their own manager"
                );
            }

            manager = userRepository
                    .findByEmployeeId(managerEmployeeId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Manager not found with employeeId "
                                            + managerEmployeeId
                            )
                    );

            // Only MANAGER can be assigned as manager
            if (manager.getRole() != Role.MANAGER) {

                throw new BadRequestException(
                        "Selected user does not have MANAGER role"
                );
            }
        }

        /*
         * Password is mandatory.
         *
         * The raw password is supplied by the administrator
         * and stored only after BCrypt encoding.
         */
        String encodedPassword =
                passwordEncoder.encode(
                        request.getPassword()
                );

        User user = User.builder()
                .employeeId(request.getEmployeeId())
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(encodedPassword)
                .role(role)
                .department(request.getDepartment())
                .position(request.getPosition())
                .joiningDate(request.getJoiningDate())
                .manager(manager)
                .active(true)
                .build();

        user = userRepository.save(user);

        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees(
            String department) {

        List<User> users =
                (department != null
                        && !department.isBlank())
                        ? userRepository.findByDepartment(
                                department)
                        : userRepository.findAll();

        return users.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeByEmployeeId(
            String employeeId) {

        User user =
                userRepository
                        .findByEmployeeId(employeeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found with employeeId "
                                                + employeeId
                                )
                        );

        return toResponse(user);
    }

    public User getUserEntityByEmployeeId(
            String employeeId) {

        return userRepository
                .findByEmployeeId(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with employeeId "
                                        + employeeId
                        )
                );
    }

    public EmployeeResponse toResponse(User user) {

        return EmployeeResponse.builder()
                .id(user.getId())
                .employeeId(user.getEmployeeId())
                .name(user.getName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .position(user.getPosition())
                .joiningDate(user.getJoiningDate())
                .role(user.getRole().name())
                .managerEmployeeId(
                        user.getManager() != null
                                ? user.getManager()
                                        .getEmployeeId()
                                : null
                )
                .active(user.isActive())
                .build();
    }
}
