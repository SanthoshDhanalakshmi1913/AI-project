package com.edugenie.controller;

import com.edugenie.request.AiAssistantRequest;
import com.edugenie.response.AiAssistantResponse;
import com.edugenie.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiLearningAssistantController {

    private final AiService aiService;

    @PostMapping("/assistant")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> askAssistant(
            @Valid @RequestBody AiAssistantRequest request,
            Authentication authentication
    ) {
        if (request.getTaskType() == null) {
            request.setTaskType(com.edugenie.util.AiTaskType.FOLLOW_UP);
        }

        String answer = null;
        AiAssistantResponse response = null;

        switch (request.getTaskType()) {
            case EXPLAIN -> answer = aiService.generateAnswer(request);
            case EXAMPLES -> answer = aiService.generateAnswer(request);
            case SIMPLIFY -> answer = aiService.generateAnswer(request);
            case QUIZ -> response = aiService.generateQuiz(request);
            case STUDY_NOTES -> response = aiService.generateStudyNotes(request);
            case INTERVIEW_QUESTIONS -> response = aiService.generateInterviewQuestions(request);
            case SUMMARIZE -> response = aiService.summarizeContent(request);
            case FOLLOW_UP -> answer = aiService.generateAnswer(request);
            default -> throw new IllegalArgumentException("Unsupported AI task type");
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("success", true);
        payload.put("message", "AI assistant task completed successfully");

        if (response != null) {
            payload.put("data", response);
        } else {
            Map<String, Object> data = new HashMap<>();
            data.put("taskType", request.getTaskType());
            data.put("answer", answer);
            data.put("topic", request.getTopic());
            payload.put("data", data);
        }

        return new ResponseEntity<>(payload, HttpStatus.OK);
    }
}
