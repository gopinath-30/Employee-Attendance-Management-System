package com.eams.controller;

import com.eams.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void register_thenLogin_succeeds() throws Exception {
        Map<String, Object> registerPayload = Map.of(
                "name", "Jane Employee",
                "email", "jane@example.com",
                "password", "password123",
                "employeeId", "EMP010",
                "department", "HR",
                "position", "HR Specialist");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerPayload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("EMPLOYEE"));

        Map<String, Object> loginPayload = Map.of(
                "email", "jane@example.com",
                "password", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void login_withWrongPassword_returnsUnauthorized() throws Exception {
        Map<String, Object> registerPayload = Map.of(
                "name", "Jane Employee",
                "email", "jane2@example.com",
                "password", "password123",
                "employeeId", "EMP011",
                "department", "HR",
                "position", "HR Specialist");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerPayload)));

        Map<String, Object> badLogin = Map.of(
                "email", "jane2@example.com",
                "password", "wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_withDuplicateEmail_returnsConflict() throws Exception {
        Map<String, Object> registerPayload = Map.of(
                "name", "Jane Employee",
                "email", "dupe@example.com",
                "password", "password123",
                "employeeId", "EMP012",
                "department", "HR",
                "position", "HR Specialist");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerPayload)))
                .andExpect(status().isCreated());

        Map<String, Object> duplicatePayload = Map.of(
                "name", "Another Person",
                "email", "dupe@example.com",
                "password", "password456",
                "employeeId", "EMP013",
                "department", "HR",
                "position", "HR Specialist");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicatePayload)))
                .andExpect(status().isConflict());
    }
}
