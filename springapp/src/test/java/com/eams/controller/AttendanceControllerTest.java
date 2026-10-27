package com.eams.controller;

import com.eams.entity.Role;
import com.eams.entity.User;
import com.eams.repository.AttendanceLogRepository;
import com.eams.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AttendanceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceLogRepository attendanceLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String employeeToken;

    @BeforeEach
    void setUp() throws Exception {
        attendanceLogRepository.deleteAll();
        userRepository.deleteAll();

        userRepository.save(User.builder()
                .employeeId("EMP001")
                .name("John Doe")
                .email("john.doe@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.EMPLOYEE)
                .department("Engineering")
                .position("Software Developer")
                .joiningDate(LocalDate.of(2023, 1, 15))
                .active(true)
                .build());

        String loginBody = objectMapper.writeValueAsString(Map.of(
                "email", "john.doe@example.com",
                "password", "password123"));

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode node = objectMapper.readTree(response);
        employeeToken = node.get("token").asText();
    }

    @Test
    void checkIn_thenDuplicateCheckIn_isRejected() throws Exception {
        Map<String, Object> checkInPayload = Map.of(
                "employeeId", "EMP001",
                "checkInTime", LocalDateTime.of(2023, 6, 1, 9, 0).toString());

        mockMvc.perform(post("/api/attendance/check-in")
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkInPayload)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/attendance/check-in")
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkInPayload)))
                .andExpect(status().isConflict());
    }

    @Test
    void checkOut_withoutCheckIn_returnsBadRequest() throws Exception {
        Map<String, Object> checkOutPayload = Map.of(
                "employeeId", "EMP001",
                "checkOutTime", LocalDateTime.of(2023, 6, 1, 17, 30).toString());

        mockMvc.perform(put("/api/attendance/check-out")
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkOutPayload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void checkIn_thenCheckOut_calculatesWorkHoursAndStatus() throws Exception {
        Map<String, Object> checkInPayload = Map.of(
                "employeeId", "EMP001",
                "checkInTime", LocalDateTime.of(2023, 6, 1, 9, 0).toString());
        Map<String, Object> checkOutPayload = Map.of(
                "employeeId", "EMP001",
                "checkOutTime", LocalDateTime.of(2023, 6, 1, 17, 30).toString());

        mockMvc.perform(post("/api/attendance/check-in")
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkInPayload)))
                .andExpect(status().isCreated());

        mockMvc.perform(put("/api/attendance/check-out")
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkOutPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalHours").value(8.5))
                .andExpect(jsonPath("$.status").value("Present"));
    }

    @Test
    void checkOut_beforeCheckIn_isRejected() throws Exception {
        Map<String, Object> checkInPayload = Map.of(
                "employeeId", "EMP001",
                "checkInTime", LocalDateTime.of(2023, 6, 1, 9, 0).toString());
        Map<String, Object> invalidCheckOutPayload = Map.of(
                "employeeId", "EMP001",
                "checkOutTime", LocalDateTime.of(2023, 6, 1, 8, 0).toString());

        mockMvc.perform(post("/api/attendance/check-in")
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkInPayload)))
                .andExpect(status().isCreated());

        mockMvc.perform(put("/api/attendance/check-out")
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidCheckOutPayload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void monthlyReport_forEmployeeWithNoRecords_returnsZeroedSummary() throws Exception {
        mockMvc.perform(get("/api/attendance/report")
                        .header("Authorization", "Bearer " + employeeToken)
                        .param("employeeId", "EMP001")
                        .param("year", "2023")
                        .param("month", "6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value("EMP001"));
    }

    @Test
    void checkIn_withUnauthenticatedRequest_isRejected() throws Exception {
        Map<String, Object> checkInPayload = Map.of("employeeId", "EMP001");
        mockMvc.perform(post("/api/attendance/check-in")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkInPayload)))
                .andExpect(status().isUnauthorized());
    }
}
