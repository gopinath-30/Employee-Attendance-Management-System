package com.eams.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.eams.repository.UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    private Map<String, Object> validEmployeePayload(String employeeId) {
        return Map.of(
                "employeeId", employeeId,
                "name", "John Doe",
                "email", employeeId.toLowerCase() + "@example.com",
                "department", "Engineering",
                "position", "Software Developer",
                "joiningDate", LocalDate.of(2023, 1, 15).toString()
        );
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createEmployee_withValidData_returns201() throws Exception {
        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validEmployeePayload("EMP001"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeId").value("EMP001"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createEmployee_withInvalidEmployeeIdFormat_returns400() throws Exception {
        Map<String, Object> payload = new java.util.HashMap<>(validEmployeePayload("EMP1"));
        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getEmployeeById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/employees/EMP999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllEmployees_supportsDepartmentFilter() throws Exception {
        mockMvc.perform(post("/api/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validEmployeePayload("EMP002"))));

        mockMvc.perform(get("/api/employees").param("department", "Engineering"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].department").value("Engineering"));
    }
}
