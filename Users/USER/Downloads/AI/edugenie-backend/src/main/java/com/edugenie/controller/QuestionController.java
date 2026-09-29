package com.edugenie.controller;

import com.edugenie.request.QuestionRequest;
import com.edugenie.response.QuestionResponse;
import com.edugenie.service.QuestionService;
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
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping("/quizzes/{quizId}/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> createQuestion(
            @PathVariable Long quizId,
            @Valid @RequestBody QuestionRequest request,
            Authentication authentication) {
        QuestionResponse question = questionService.createQuestion(quizId, request, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Question created successfully");
        response.put("data", question);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/quizzes/{quizId}/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> getQuestionsByQuiz(@PathVariable Long quizId) {
        List<QuestionResponse> questions = questionService.getQuestionsByQuiz(quizId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Questions retrieved successfully");
        response.put("data", questions);
        return ResponseEntity.ok(response);
    }
}
