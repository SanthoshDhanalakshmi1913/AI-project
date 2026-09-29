package com.edugenie.controller;

import com.edugenie.request.StudyNotesRequest;
import com.edugenie.response.StudyNotesResponse;
import com.edugenie.service.StudyNotesService;
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
public class StudyNotesController {

    private final StudyNotesService studyNotesService;

    @PostMapping("/study-notes")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> generateStudyNotes(
            @Valid @RequestBody StudyNotesRequest request,
            Authentication authentication
    ) {
        StudyNotesResponse response = studyNotesService.generateStudyNotes(request, authentication.getName());

        Map<String, Object> payload = new HashMap<>();
        payload.put("success", true);
        payload.put("message", "AI study notes generated successfully");
        payload.put("data", response);

        return new ResponseEntity<>(payload, HttpStatus.OK);
    }
}
