package com.edugenie.service.impl;

import com.edugenie.entity.Course;
import com.edugenie.entity.Role;
import com.edugenie.entity.User;
import com.edugenie.exception.ApiException;
import com.edugenie.repository.CourseRepository;
import com.edugenie.repository.UserRepository;
import com.edugenie.request.CourseRequest;
import com.edugenie.response.CourseResponse;
import com.edugenie.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Override
    public CourseResponse createCourse(CourseRequest request, String email) {
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        if (!isAdminOrInstructor(instructor.getRole())) {
            throw new ApiException("You are not allowed to create courses");
        }

        Course course = new Course();
        course.setTitle(request.getTitle().trim());
        course.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        course.setCategory(request.getCategory().trim());
        course.setLevel(request.getLevel().trim());
        course.setInstructor(instructor);

        Course savedCourse = courseRepository.save(course);
        return mapToResponse(savedCourse);
    }

    @Override
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CourseResponse getCourseById(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException("Course not found"));
        return mapToResponse(course);
    }

    @Override
    public CourseResponse updateCourse(Long courseId, CourseRequest request, String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException("Course not found"));

        if (currentUser.getRole() == Role.ADMIN) {
            // admin can update any course
        } else if (currentUser.getRole() == Role.INSTRUCTOR
                && course.getInstructor().getId().equals(currentUser.getId())) {
            // instructor can update own course
        } else {
            throw new ApiException("You are not allowed to update this course");
        }

        course.setTitle(request.getTitle().trim());
        course.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        course.setCategory(request.getCategory().trim());
        course.setLevel(request.getLevel().trim());

        return mapToResponse(courseRepository.save(course));
    }

    @Override
    public void deleteCourse(Long courseId, String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException("Course not found"));

        if (currentUser.getRole() == Role.ADMIN) {
            // admin can delete any course
        } else if (currentUser.getRole() == Role.INSTRUCTOR
                && course.getInstructor().getId().equals(currentUser.getId())) {
            // instructor can delete own course
        } else {
            throw new ApiException("You are not allowed to delete this course");
        }

        courseRepository.delete(course);
    }

    private boolean isAdminOrInstructor(Role role) {
        return role == Role.ADMIN || role == Role.INSTRUCTOR;
    }

    private CourseResponse mapToResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .category(course.getCategory())
                .level(course.getLevel())
                .instructorId(course.getInstructor() != null ? course.getInstructor().getId() : null)
                .instructorName(course.getInstructor() != null ? course.getInstructor().getName() : null)
                .createdAt(course.getCreatedAt())
                .build();
    }
}
