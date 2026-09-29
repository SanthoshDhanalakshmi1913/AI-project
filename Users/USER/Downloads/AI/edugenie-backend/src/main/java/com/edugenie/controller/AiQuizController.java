package com.edugenie.controller;

import com.edugenie.request.AiQuizRequest;
import com.edugenie.response.AiQuizResponse;
import com.edugenie.service.AiQuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiQuizController {

    private final AiQuizService aiQuizService;

    @PostMapping("/quiz/generate")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> generateQuiz(
            @Valid @RequestBody AiQuizRequest request,
            org.springframework.security.core.Authentication authentication
    ) {
        AiQuizResponse response = aiQuizService.generateQuiz(request, authentication.getName());

        Map<String, Object> payload = new HashMap<>();
        payload.put("success", true);
        payload.put("message", "AI quiz generated successfully");
        payload.put("data", response);

        return new ResponseEntity<>(payload, HttpStatus.OK);
    }
}
