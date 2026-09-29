package com.edugenie.service.impl;

import com.edugenie.entity.*;
import com.edugenie.exception.ApiException;
import com.edugenie.repository.*;
import com.edugenie.request.QuizAttemptRequest;
import com.edugenie.request.StudentAnswerRequest;
import com.edugenie.response.QuizAttemptResponse;
import com.edugenie.response.StudentAnswerResponse;
import com.edugenie.service.QuizAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizAttemptServiceImpl implements QuizAttemptService {

    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final QuestionRepository questionRepository;

    @Override
    @Transactional
    public QuizAttemptResponse submitQuiz(Long quizId, QuizAttemptRequest request, String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ApiException("Quiz not found"));

        if (request.getAnswers() == null || request.getAnswers().isEmpty()) {
            throw new ApiException("Please provide answers to submit the quiz");
        }

        List<Question> questions = questionRepository.findByQuizId(quizId);
        if (questions.isEmpty()) {
            throw new ApiException("Quiz has no questions");
        }

        Map<Long, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        int score = 0;
        List<StudentAnswer> savedAnswers = new ArrayList<>();

        for (StudentAnswerRequest answerRequest : request.getAnswers()) {
            Question question = questionMap.get(answerRequest.getQuestionId());
            if (question == null) {
                throw new ApiException("Question not found in quiz: " + answerRequest.getQuestionId());
            }

            String submittedValue = answerRequest.getSelectedAnswer() != null ? answerRequest.getSelectedAnswer().trim()
                    : "";
            boolean isCorrect = submittedValue.equalsIgnoreCase(question.getCorrectAnswer().trim());
            if (isCorrect) {
                score++;
            }

            StudentAnswer studentAnswer = new StudentAnswer();
            studentAnswer.setQuestion(question);
            studentAnswer.setSelectedAnswer(submittedValue);
            studentAnswer.setIsCorrect(isCorrect);
            savedAnswers.add(studentAnswer);
        }

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setUser(student);
        attempt.setScore(score);
        attempt.setTotalQuestions(questions.size());
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setCompletedAt(LocalDateTime.now());

        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        for (StudentAnswer answer : savedAnswers) {
            answer.setAttempt(savedAttempt);
        }
        studentAnswerRepository.saveAll(savedAnswers);

        return mapToResponse(savedAttempt, savedAnswers);
    }

    @Override
    public List<QuizAttemptResponse> getMyAttempts(String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        return quizAttemptRepository.findByUserIdOrderByCompletedAtDesc(student.getId()).stream()
                .map(attempt -> mapToResponse(attempt, studentAnswerRepository.findByAttemptId(attempt.getId())))
                .toList();
    }

    @Override
    public QuizAttemptResponse getAttemptById(Long attemptId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ApiException("Attempt not found"));

        if (user.getRole() == Role.STUDENT && !attempt.getUser().getId().equals(user.getId())) {
            throw new ApiException("You are not allowed to view this attempt");
        }

        return mapToResponse(attempt, studentAnswerRepository.findByAttemptId(attemptId));
    }

    private QuizAttemptResponse mapToResponse(QuizAttempt attempt, List<StudentAnswer> answers) {
        List<StudentAnswerResponse> answerResponses = answers.stream()
                .map(answer -> StudentAnswerResponse.builder()
                        .id(answer.getId())
                        .attemptId(answer.getAttempt() != null ? answer.getAttempt().getId() : null)
                        .questionId(answer.getQuestion() != null ? answer.getQuestion().getId() : null)
                        .questionText(answer.getQuestion() != null ? answer.getQuestion().getQuestionText() : null)
                        .correctAnswer(answer.getQuestion() != null ? answer.getQuestion().getCorrectAnswer() : null)
                        .selectedAnswer(answer.getSelectedAnswer())
                        .isCorrect(answer.getIsCorrect())
                        .build())
                .toList();

        double percentage = attempt.getTotalQuestions() == 0 ? 0
                : (attempt.getScore() * 100.0) / attempt.getTotalQuestions();

        return QuizAttemptResponse.builder()
                .id(attempt.getId())
                .userId(attempt.getUser() != null ? attempt.getUser().getId() : null)
                .quizId(attempt.getQuiz() != null ? attempt.getQuiz().getId() : null)
                .score(attempt.getScore())
                .totalQuestions(attempt.getTotalQuestions())
                .percentage((int) Math.round(percentage))
                .passed(percentage >= 50.0)
                .startedAt(attempt.getStartedAt())
                .completedAt(attempt.getCompletedAt())
                .answers(answerResponses)
                .build();
    }
}
