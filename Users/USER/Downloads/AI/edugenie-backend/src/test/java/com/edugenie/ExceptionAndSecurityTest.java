package com.edugenie;

import com.edugenie.entity.Role;
import com.edugenie.exception.ApiException;
import com.edugenie.exception.GlobalExceptionHandler;
import com.edugenie.request.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ExceptionAndSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatModel chatModel;

    private final GlobalExceptionHandler exceptionHandler = new GlobalExceptionHandler();

    private String studentToken;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest request = new RegisterRequest("Sec Student", "sec_student_" + System.currentTimeMillis() + "@test.com", "password123", Role.STUDENT);
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        studentToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("token").asText();
    }

    @Test
    @DisplayName("Should return 401 Unauthorized when accessing protected route without token")
    void testUnauthorizedNoToken() throws Exception {
        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Should return 401 Unauthorized when token is invalid or expired")
    void testUnauthorizedInvalidToken() throws Exception {
        mockMvc.perform(get("/api/courses")
                        .header("Authorization", "Bearer invalid-jwt-signature-xyz"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Should return 403 Forbidden when Student accesses Admin-only route")
    void testForbiddenRoleAccess() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Should return 400 Bad Request on malformed JSON payload")
    void testMalformedJsonPayload() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"badjson, missing bracket"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GlobalExceptionHandler should map Gemini API Key missing error to 500")
    void testGeminiApiKeyMissingErrorMapping() {
        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleApiException(new ApiException("Gemini API key is missing. Set the GEMINI_API_KEY environment variable."));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertFalse((Boolean) response.getBody().get("success"));
        assertEquals("Gemini API key is missing. Set the GEMINI_API_KEY environment variable.", response.getBody().get("message"));
    }

    @Test
    @DisplayName("GlobalExceptionHandler should map Gemini Timeout or Failure error to 502 Bad Gateway")
    void testGeminiTimeoutErrorMapping() {
        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleApiException(new ApiException("Gemini API failure: connection timed out"));

        assertEquals(HttpStatus.BAD_GATEWAY, response.getStatusCode());
        assertFalse((Boolean) response.getBody().get("success"));
    }

    @Test
    @DisplayName("GlobalExceptionHandler should map Database Integrity Violation to 400 Bad Request")
    void testDatabaseIntegrityViolationMapping() {
        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleDataIntegrityViolation(new DataIntegrityViolationException("Duplicate entry 'test@example.com' for key 'users.email'"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse((Boolean) response.getBody().get("success"));
    }
}
