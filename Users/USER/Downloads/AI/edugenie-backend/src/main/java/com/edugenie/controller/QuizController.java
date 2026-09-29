package com.edugenie.controller;

import com.edugenie.request.QuizRequest;
import com.edugenie.response.QuizResponse;
import com.edugenie.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/quizzes")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> createQuiz(
            @Valid @RequestBody QuizRequest request,
            Authentication authentication) {
        QuizResponse quiz = quizService.createQuiz(request, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Quiz created successfully");
        response.put("data", quiz);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/quizzes")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> getAllQuizzes() {
        List<QuizResponse> quizzes = quizService.getAllQuizzes();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Quizzes retrieved successfully");
        response.put("data", quizzes);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/quizzes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> getQuizById(@PathVariable Long id) {
        QuizResponse quiz = quizService.getQuizById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Quiz retrieved successfully");
        response.put("data", quiz);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/quizzes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> updateQuiz(
            @PathVariable Long id,
            @Valid @RequestBody QuizRequest request,
            Authentication authentication) {
        QuizResponse quiz = quizService.updateQuiz(id, request, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Quiz updated successfully");
        response.put("data", quiz);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/quizzes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> deleteQuiz(
            @PathVariable Long id,
            Authentication authentication) {
        quizService.deleteQuiz(id, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Quiz deleted successfully");
        return ResponseEntity.ok(response);
    }
}
