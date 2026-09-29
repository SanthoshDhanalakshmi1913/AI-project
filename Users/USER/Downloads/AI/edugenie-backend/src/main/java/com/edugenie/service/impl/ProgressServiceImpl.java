package com.edugenie.service.impl;

import com.edugenie.entity.Course;
import com.edugenie.entity.Lesson;
import com.edugenie.entity.QuizAttempt;
import com.edugenie.entity.Role;
import com.edugenie.entity.User;
import com.edugenie.exception.ApiException;
import com.edugenie.repository.ChatConversationRepository;
import com.edugenie.repository.ChatMessageRepository;
import com.edugenie.repository.CourseRepository;
import com.edugenie.repository.LessonRepository;
import com.edugenie.repository.QuizAttemptRepository;
import com.edugenie.repository.UserRepository;
import com.edugenie.response.StudentProgressResponse;
import com.edugenie.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final ChatConversationRepository chatConversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Override
    public StudentProgressResponse getMyProgress(String email) {
        User student = getStudent(email);

        List<QuizAttempt> attempts = quizAttemptRepository.findByUserOrderByCompletedAtDesc(student);
        List<Course> enrolledCourses = getEnrolledCourses(student, attempts);

        double averageScore = calculateAverageQuizScore(attempts);
        long lessonsCompleted = calculateLessonsCompleted(enrolledCourses, attempts);
        int overallProgress = calculateOverallProgress(enrolledCourses, attempts);
        int coursesCompleted = calculateCompletedCourses(enrolledCourses, attempts);
        long aiQuestionsAsked = countAiQuestions(student);

        return StudentProgressResponse.builder()
                .coursesEnrolled(enrolledCourses.size())
                .coursesCompleted(coursesCompleted)
                .averageQuizScore(Math.round(averageScore * 100.0) / 100.0)
                .lessonsCompleted(lessonsCompleted)
                .overallProgress(overallProgress)
                .quizAttempts((long) attempts.size())
                .aiQuestionsAsked(aiQuestionsAsked)
                .build();
    }

    @Override
    public StudentProgressResponse getCourseProgress(Long courseId, String email) {
        User student = getStudent(email);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException("Course not found"));

        List<Lesson> lessons = lessonRepository.findByCourseOrderByLessonOrderAsc(course);
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserOrderByCompletedAtDesc(student).stream()
                .filter(attempt -> attempt.getQuiz() != null && attempt.getQuiz().getCourse() != null
                        && attempt.getQuiz().getCourse().getId().equals(courseId))
                .sorted(Comparator.comparing(QuizAttempt::getCompletedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        int progress = calculateCourseProgress(course, attempts);
        long lessonsCompleted = calculateCourseLessonsCompleted(lessons, attempts, progress);
        double averageScore = calculateAverageQuizScore(attempts);

        return StudentProgressResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .coursesEnrolled(1)
                .coursesCompleted(progress >= 80 ? 1 : 0)
                .averageQuizScore(Math.round(averageScore * 100.0) / 100.0)
                .lessonsCompleted(lessonsCompleted)
                .overallProgress(progress)
                .quizAttempts((long) attempts.size())
                .aiQuestionsAsked(countAiQuestions(student))
                .build();
    }

    private User getStudent(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        if (user.getRole() != Role.STUDENT && user.getRole() != Role.ADMIN) {
            throw new ApiException("Only students and administrators can access progress data");
        }

        return user;
    }

    private List<Course> getEnrolledCourses(User student, List<QuizAttempt> attempts) {
        Set<Long> courseIds = attempts.stream()
                .map(attempt -> attempt.getQuiz())
                .filter(java.util.Objects::nonNull)
                .map(quiz -> quiz.getCourse())
                .filter(java.util.Objects::nonNull)
                .map(Course::getId)
                .collect(Collectors.toSet());

        if (courseIds.isEmpty()) {
            return new ArrayList<>();
        }

        return courseRepository.findAllById(courseIds);
    }

    private double calculateAverageQuizScore(List<QuizAttempt> attempts) {
        if (attempts.isEmpty()) {
            return 0.0;
        }

        double sum = attempts.stream()
                .filter(attempt -> attempt.getTotalQuestions() != null && attempt.getTotalQuestions() > 0)
                .mapToDouble(attempt -> (attempt.getScore() * 100.0) / attempt.getTotalQuestions())
                .sum();

        return sum / attempts.size();
    }

    private long calculateLessonsCompleted(List<Course> courses, List<QuizAttempt> attempts) {
        if (courses.isEmpty()) {
            return 0L;
        }

        long total = 0L;
        for (Course course : courses) {
            List<Lesson> lessons = lessonRepository.findByCourseOrderByLessonOrderAsc(course);
            int progress = calculateCourseProgress(course, attempts);
            total += calculateCourseLessonsCompleted(lessons, attempts, progress);
        }
        return total;
    }

    private int calculateOverallProgress(List<Course> courses, List<QuizAttempt> attempts) {
        if (courses.isEmpty()) {
            return 0;
        }

        int totalProgress = 0;
        for (Course course : courses) {
            totalProgress += calculateCourseProgress(course, attempts);
        }

        return Math.round(totalProgress / (float) courses.size());
    }

    private int calculateCompletedCourses(List<Course> courses, List<QuizAttempt> attempts) {
        if (courses.isEmpty()) {
            return 0;
        }

        int completed = 0;
        for (Course course : courses) {
            if (calculateCourseProgress(course, attempts) >= 80) {
                completed++;
            }
        }
        return completed;
    }

    private int calculateCourseProgress(Course course, List<QuizAttempt> attempts) {
        List<Lesson> lessons = lessonRepository.findByCourseOrderByLessonOrderAsc(course);
        if (lessons.isEmpty()) {
            if (attempts.isEmpty()) {
                return 0;
            }
            return Math.min(100, Math.round((float) attempts.size() * 20));
        }

        double quizAverage = calculateAverageQuizScore(attempts.stream()
                .filter(attempt -> attempt.getQuiz() != null && attempt.getQuiz().getCourse() != null
                        && attempt.getQuiz().getCourse().getId().equals(course.getId()))
                .toList());

        double lessonCoverage = (Math.min(lessons.size(), Math.max(1, (int) Math.round(quizAverage / 20.0))) / (double) lessons.size()) * 100.0;
        return Math.min(100, (int) Math.round((quizAverage * 0.7) + (lessonCoverage * 0.3)));
    }

    private long calculateCourseLessonsCompleted(List<Lesson> lessons, List<QuizAttempt> attempts, int progress) {
        if (lessons.isEmpty()) {
            return 0L;
        }

        if (attempts.isEmpty()) {
            return 0L;
        }

        double ratio = progress / 100.0;
        return Math.round(lessons.size() * ratio);
    }

    private long countAiQuestions(User student) {
        return chatConversationRepository.findByUserOrderByUpdatedAtDesc(student).stream()
                .flatMap(conversation -> chatMessageRepository.findByConversationOrderByCreatedAtAsc(conversation).stream())
                .filter(message -> "USER".equalsIgnoreCase(message.getRole()))
                .count();
    }
}
