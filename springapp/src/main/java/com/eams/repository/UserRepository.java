package com.eams.repository;

import com.eams.entity.Role;
import com.eams.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmployeeId(String employeeId);
    boolean existsByEmail(String email);
    boolean existsByEmployeeId(String employeeId);
    List<User> findByDepartment(String department);
    List<User> findByManagerId(Long managerId);
    List<User> findByRole(Role role);
}
