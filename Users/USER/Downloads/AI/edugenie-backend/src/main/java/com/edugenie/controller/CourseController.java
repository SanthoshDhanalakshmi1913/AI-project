package com.edugenie.controller;

import com.edugenie.request.CourseRequest;
import com.edugenie.response.CourseResponse;
import com.edugenie.service.CourseService;
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
public class CourseController {

    private final CourseService courseService;

    @PostMapping("/courses")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> createCourse(
            @Valid @RequestBody CourseRequest request,
            Authentication authentication) {
        CourseResponse course = courseService.createCourse(request, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Course created successfully");
        response.put("data", course);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/courses")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> getAllCourses() {
        List<CourseResponse> courses = courseService.getAllCourses();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Courses retrieved successfully");
        response.put("data", courses);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/courses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Course retrieved successfully");
        response.put("data", course);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/courses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request,
            Authentication authentication) {
        CourseResponse course = courseService.updateCourse(id, request, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Course updated successfully");
        response.put("data", course);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/courses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> deleteCourse(
            @PathVariable Long id,
            Authentication authentication) {
        courseService.deleteCourse(id, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Course deleted successfully");
        return ResponseEntity.ok(response);
    }
}
