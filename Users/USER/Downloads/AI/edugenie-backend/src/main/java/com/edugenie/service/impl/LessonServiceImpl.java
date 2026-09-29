package com.edugenie.service.impl;

import com.edugenie.entity.Course;
import com.edugenie.entity.Lesson;
import com.edugenie.entity.Role;
import com.edugenie.entity.User;
import com.edugenie.exception.ApiException;
import com.edugenie.repository.CourseRepository;
import com.edugenie.repository.LessonRepository;
import com.edugenie.repository.UserRepository;
import com.edugenie.request.LessonRequest;
import com.edugenie.response.LessonResponse;
import com.edugenie.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Override
    public LessonResponse createLesson(Long courseId, LessonRequest request, String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException("Course not found"));

        if (currentUser.getRole() == Role.ADMIN || (currentUser.getRole() == Role.INSTRUCTOR
                && course.getInstructor().getId().equals(currentUser.getId()))) {
            // allowed
        } else {
            throw new ApiException("You are not allowed to add lessons to this course");
        }

        if (lessonRepository.existsByCourseAndLessonOrder(course, request.getLessonOrder())) {
            throw new ApiException("A lesson with this order already exists for the course");
        }

        Lesson lesson = new Lesson();
        lesson.setTitle(request.getTitle().trim());
        lesson.setContent(request.getContent().trim());
        lesson.setLessonOrder(request.getLessonOrder());
        lesson.setCourse(course);

        Lesson savedLesson = lessonRepository.save(lesson);
        return mapToResponse(savedLesson);
    }

    @Override
    public List<LessonResponse> getLessonsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException("Course not found"));

        return lessonRepository.findByCourseOrderByLessonOrderAsc(course).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public LessonResponse updateLesson(Long lessonId, LessonRequest request, String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ApiException("Lesson not found"));

        if (currentUser.getRole() == Role.ADMIN || (currentUser.getRole() == Role.INSTRUCTOR
                && lesson.getCourse().getInstructor().getId().equals(currentUser.getId()))) {
            // allowed
        } else {
            throw new ApiException("You are not allowed to update this lesson");
        }

        lesson.setTitle(request.getTitle().trim());
        lesson.setContent(request.getContent().trim());
        lesson.setLessonOrder(request.getLessonOrder());

        return mapToResponse(lessonRepository.save(lesson));
    }

    @Override
    public void deleteLesson(Long lessonId, String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ApiException("Lesson not found"));

        if (currentUser.getRole() == Role.ADMIN || (currentUser.getRole() == Role.INSTRUCTOR
                && lesson.getCourse().getInstructor().getId().equals(currentUser.getId()))) {
            // allowed
        } else {
            throw new ApiException("You are not allowed to delete this lesson");
        }

        lessonRepository.delete(lesson);
    }

    private LessonResponse mapToResponse(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .courseId(lesson.getCourse().getId())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .lessonOrder(lesson.getLessonOrder())
                .build();
    }
}
