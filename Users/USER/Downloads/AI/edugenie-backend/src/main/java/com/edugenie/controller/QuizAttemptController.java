package com.edugenie.controller;

import com.edugenie.request.QuizAttemptRequest;
import com.edugenie.response.QuizAttemptResponse;
import com.edugenie.service.QuizAttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    @PostMapping("/quizzes/{quizId}/attempt")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> submitQuiz(
            @PathVariable Long quizId,
            @Valid @RequestBody QuizAttemptRequest request,
            Authentication authentication) {
        QuizAttemptResponse result = quizAttemptService.submitQuiz(quizId, request, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Quiz submitted successfully");
        response.put("data", result);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/quiz-attempts/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getMyAttempts(Authentication authentication) {
        List<QuizAttemptResponse> attempts = quizAttemptService.getMyAttempts(authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Attempts retrieved successfully");
        response.put("data", attempts);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/quiz-attempts/{attemptId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> getAttemptById(
            @PathVariable Long attemptId,
            Authentication authentication) {
        QuizAttemptResponse attempt = quizAttemptService.getAttemptById(attemptId, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Attempt retrieved successfully");
        response.put("data", attempt);
        return ResponseEntity.ok(response);
    }
}
