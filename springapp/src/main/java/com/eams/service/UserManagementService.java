
package com.eams.service;

import com.eams.dto.EmployeeResponse;
import com.eams.dto.UserUpdateRequest;
import com.eams.entity.Role;
import com.eams.entity.User;
import com.eams.exception.BadRequestException;
import com.eams.exception.ResourceNotFoundException;
import com.eams.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final EmployeeService employeeService;

    public UserManagementService(
            UserRepository userRepository,
            EmployeeService employeeService) {

        this.userRepository = userRepository;
        this.employeeService = employeeService;
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(employeeService::toResponse)
                .toList();
    }

//     @Transactional(readOnly = true)
//     public List<EmployeeResponse> getTeamMembers(Long managerId) {

//         return userRepository.findByManagerId(managerId)
//                 .stream()
//                 .map(employeeService::toResponse)
//                 .toList();
//     }

@Transactional(readOnly = true)
public List<EmployeeResponse> getTeamMembers(Long managerId) {

    return userRepository.findByManagerId(managerId)
            .stream()
            .filter(user -> user.getRole() == Role.EMPLOYEE)
            .map(employeeService::toResponse)
            .toList();
}


    @Transactional
    public EmployeeResponse updateUser(
            String employeeId,
            UserUpdateRequest request) {

        User user =
                userRepository
                        .findByEmployeeId(employeeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found with employeeId "
                                                + employeeId
                                )
                        );

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }

        if (request.getPosition() != null) {
            user.setPosition(request.getPosition());
        }

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        if (request.getRole() != null
                && !request.getRole().isBlank()) {

            try {

                Role newRole =
                        Role.valueOf(
                                request.getRole()
                                        .trim()
                                        .toUpperCase()
                        );

                user.setRole(newRole);

                /*
                 * An ADMIN cannot have a manager.
                 */
                if (newRole == Role.ADMIN) {
                    user.setManager(null);
                }

            } catch (IllegalArgumentException ex) {

                throw new BadRequestException(
                        "Invalid role: " + request.getRole()
                );
            }
        }

        if (request.getManagerEmployeeId() != null) {

            String managerEmployeeId =
                    request.getManagerEmployeeId().trim();

            if (managerEmployeeId.isBlank()) {

                user.setManager(null);

            } else {

                /*
                 * Employee cannot be their own manager.
                 */
                if (managerEmployeeId.equalsIgnoreCase(
                        user.getEmployeeId())) {

                    throw new BadRequestException(
                            "An employee cannot be assigned as their own manager"
                    );
                }

                User manager =
                        userRepository
                                .findByEmployeeId(managerEmployeeId)
                                .orElseThrow(() ->
                                        new ResourceNotFoundException(
                                                "Manager not found with employeeId "
                                                        + managerEmployeeId
                                        )
                                );

                /*
                 * Only MANAGER users can be assigned
                 * as managers.
                 */
                if (manager.getRole() != Role.MANAGER) {

                    throw new BadRequestException(
                            "Selected user does not have MANAGER role"
                    );
                }

                user.setManager(manager);
            }
        }

        user = userRepository.save(user);

        return employeeService.toResponse(user);
    }

    @Transactional
    public EmployeeResponse deactivateUser(
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

        user.setActive(false);

        user = userRepository.save(user);

        return employeeService.toResponse(user);
    }
}
