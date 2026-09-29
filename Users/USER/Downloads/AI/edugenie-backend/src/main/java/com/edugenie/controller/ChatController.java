package com.edugenie.controller;

import com.edugenie.request.ChatRequest;
import com.edugenie.response.ChatHistoryResponse;
import com.edugenie.response.ChatResponse;
import com.edugenie.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
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
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/chat")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> askQuestion(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication
    ) {
        ChatResponse response = chatService.askQuestion(request, authentication.getName());

        Map<String, Object> payload = new HashMap<>();
        payload.put("success", true);
        payload.put("message", "AI response generated");
        payload.put("data", response);

        return new ResponseEntity<>(payload, HttpStatus.OK);
    }

    @GetMapping("/chat/history")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getChatHistory(Authentication authentication) {
        List<ChatHistoryResponse> history = chatService.getChatHistory(authentication.getName());

        Map<String, Object> payload = new HashMap<>();
        payload.put("success", true);
        payload.put("message", "Chat history retrieved successfully");
        payload.put("data", history);

        return ResponseEntity.ok(payload);
    }
}
