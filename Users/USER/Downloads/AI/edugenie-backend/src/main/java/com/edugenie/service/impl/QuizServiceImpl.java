package com.edugenie.service.impl;

import com.edugenie.entity.Course;
import com.edugenie.entity.Quiz;
import com.edugenie.entity.Role;
import com.edugenie.entity.User;
import com.edugenie.exception.ApiException;
import com.edugenie.repository.CourseRepository;
import com.edugenie.repository.QuizRepository;
import com.edugenie.repository.UserRepository;
import com.edugenie.request.QuizRequest;
import com.edugenie.response.QuizResponse;
import com.edugenie.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Override
    public QuizResponse createQuiz(QuizRequest request, String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.INSTRUCTOR) {
            throw new ApiException("You are not allowed to create quizzes");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ApiException("Course not found"));

        if (currentUser.getRole() == Role.INSTRUCTOR && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new ApiException("You can only create quizzes for your own courses");
        }

        Quiz quiz = new Quiz();
        quiz.setTitle(request.getTitle().trim());
        quiz.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        quiz.setCourse(course);

        Quiz savedQuiz = quizRepository.save(quiz);
        return mapToResponse(savedQuiz);
    }

    @Override
    public List<QuizResponse> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public QuizResponse getQuizById(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ApiException("Quiz not found"));
        return mapToResponse(quiz);
    }

    @Override
    public QuizResponse updateQuiz(Long quizId, QuizRequest request, String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ApiException("Quiz not found"));

        if (currentUser.getRole() == Role.ADMIN) {
            // admin can update any quiz
        } else if (currentUser.getRole() == Role.INSTRUCTOR
                && quiz.getCourse().getInstructor().getId().equals(currentUser.getId())) {
            // instructor can update own quiz
        } else {
            throw new ApiException("You are not allowed to update this quiz");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ApiException("Course not found"));

        if (currentUser.getRole() == Role.INSTRUCTOR && !course.getInstructor().getId().equals(currentUser.getId())) {
            throw new ApiException("You can only move quiz to your own course");
        }

        quiz.setTitle(request.getTitle().trim());
        quiz.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        quiz.setCourse(course);

        return mapToResponse(quizRepository.save(quiz));
    }

    @Override
    public void deleteQuiz(Long quizId, String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ApiException("Quiz not found"));

        if (currentUser.getRole() == Role.ADMIN) {
            // admin can delete any quiz
        } else if (currentUser.getRole() == Role.INSTRUCTOR
                && quiz.getCourse().getInstructor().getId().equals(currentUser.getId())) {
            // instructor can delete own quiz
        } else {
            throw new ApiException("You are not allowed to delete this quiz");
        }

        quizRepository.delete(quiz);
    }

    private QuizResponse mapToResponse(Quiz quiz) {
        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .courseId(quiz.getCourse() != null ? quiz.getCourse().getId() : null)
                .courseTitle(quiz.getCourse() != null ? quiz.getCourse().getTitle() : null)
                .build();
    }
}
