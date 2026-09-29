package com.edugenie.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void shouldHandleAccessDeniedException() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleAccessDeniedException(new AccessDeniedException("Forbidden"));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertFalse((Boolean) response.getBody().get("success"));
        assertEquals("Forbidden", response.getBody().get("message"));
    }

    @Test
    void shouldHandleAuthenticationException() {
        ResponseEntity<Map<String, Object>> response =
                handler.handleAuthenticationException(new AuthenticationException("Unauthorized") {
                });

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertFalse((Boolean) response.getBody().get("success"));
        assertEquals("Unauthorized", response.getBody().get("message"));
    }
}
