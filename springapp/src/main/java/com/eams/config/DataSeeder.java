package com.eams.config;

import com.eams.entity.Role;
import com.eams.entity.User;
import com.eams.entity.WeekendConfig;
import com.eams.repository.UserRepository;
import com.eams.repository.WeekendConfigRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;

/**
 * Seeds a minimal set of demo accounts and default weekend configuration
 * so the application is immediately usable after first startup.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WeekendConfigRepository weekendConfigRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                       WeekendConfigRepository weekendConfigRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.weekendConfigRepository = weekendConfigRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedWeekends();
        seedUsers();
    }

    private void seedWeekends() {
        if (weekendConfigRepository.count() == 0) {
            weekendConfigRepository.save(WeekendConfig.builder().dayOfWeek(DayOfWeek.SATURDAY).build());
            weekendConfigRepository.save(WeekendConfig.builder().dayOfWeek(DayOfWeek.SUNDAY).build());
        }
    }

    private void seedUsers() {
        if (userRepository.existsByEmail("admin@eams.com")) {
            return;
        }

        User admin = userRepository.save(User.builder()
                .employeeId("EMP000")
                .name("System Administrator")
                .email("admin@eams.com")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .department("Administration")
                .position("Administrator")
                .joiningDate(LocalDate.of(2020, 1, 1))
                .active(true)
                .build());

        User manager = userRepository.save(User.builder()
                .employeeId("EMP100")
                .name("Jane Manager")
                .email("manager@eams.com")
                .passwordHash(passwordEncoder.encode("Manager@123"))
                .role(Role.MANAGER)
                .department("Engineering")
                .position("Engineering Manager")
                .joiningDate(LocalDate.of(2021, 3, 1))
                .active(true)
                .build());

        userRepository.save(User.builder()
                .employeeId("EMP001")
                .name("John Doe")
                .email("john.doe@eams.com")
                .passwordHash(passwordEncoder.encode("Employee@123"))
                .role(Role.EMPLOYEE)
                .department("Engineering")
                .position("Software Developer")
                .joiningDate(LocalDate.of(2023, 1, 15))
                .manager(manager)
                .active(true)
                .build());
    }
}
