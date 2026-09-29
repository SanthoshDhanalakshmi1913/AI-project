package com.edugenie.controller;

import com.edugenie.request.LessonRequest;
import com.edugenie.response.LessonResponse;
import com.edugenie.service.LessonService;
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
public class LessonController {

    private final LessonService lessonService;

    @PostMapping("/courses/{courseId}/lessons")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> createLesson(
            @PathVariable Long courseId,
            @Valid @RequestBody LessonRequest request,
            Authentication authentication) {
        LessonResponse lesson = lessonService.createLesson(courseId, request, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lesson created successfully");
        response.put("data", lesson);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/courses/{courseId}/lessons")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> getLessonsByCourse(@PathVariable Long courseId) {
        List<LessonResponse> lessons = lessonService.getLessonsByCourse(courseId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lessons retrieved successfully");
        response.put("data", lessons);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/lessons/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> updateLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonRequest request,
            Authentication authentication) {
        LessonResponse lesson = lessonService.updateLesson(lessonId, request, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lesson updated successfully");
        response.put("data", lesson);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/lessons/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> deleteLesson(
            @PathVariable Long lessonId,
            Authentication authentication) {
        lessonService.deleteLesson(lessonId, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lesson deleted successfully");
        return ResponseEntity.ok(response);
    }
}
