package com.edugenie.service.impl;

import com.edugenie.entity.*;
import com.edugenie.exception.ApiException;
import com.edugenie.repository.QuestionRepository;
import com.edugenie.repository.QuizOptionRepository;
import com.edugenie.repository.QuizRepository;
import com.edugenie.repository.UserRepository;
import com.edugenie.request.QuestionRequest;
import com.edugenie.request.QuizOptionRequest;
import com.edugenie.response.QuestionResponse;
import com.edugenie.response.QuizOptionResponse;
import com.edugenie.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final UserRepository userRepository;

    @Override
    public QuestionResponse createQuestion(Long quizId, QuestionRequest request, String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ApiException("Quiz not found"));

        if (currentUser.getRole() == Role.STUDENT) {
            throw new ApiException("Students cannot create questions");
        }

        if (currentUser.getRole() == Role.INSTRUCTOR
                && !quiz.getCourse().getInstructor().getId().equals(currentUser.getId())) {
            throw new ApiException("You can only add questions to your own courses");
        }

        Question question = new Question();
        question.setQuiz(quiz);
        question.setQuestionText(request.getQuestionText().trim());
        question.setCorrectAnswer(request.getCorrectAnswer().trim());

        List<QuizOption> options = new ArrayList<>();
        for (QuizOptionRequest optionRequest : request.getOptions()) {
            QuizOption option = new QuizOption();
            option.setQuestion(question);
            option.setOptionText(optionRequest.getOptionText().trim());
            options.add(option);
        }
        question.setOptions(options);

        Question savedQuestion = questionRepository.save(question);
        quizOptionRepository.saveAll(options);

        return mapToResponse(savedQuestion);
    }

    @Override
    public List<QuestionResponse> getQuestionsByQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ApiException("Quiz not found"));

        return questionRepository.findByQuizId(quizId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private QuestionResponse mapToResponse(Question question) {
        List<QuizOptionResponse> options = question.getOptions() == null ? List.of()
                : question.getOptions().stream()
                        .map(option -> QuizOptionResponse.builder()
                                .id(option.getId())
                                .optionText(option.getOptionText())
                                .build())
                        .toList();

        return QuestionResponse.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .correctAnswer(question.getCorrectAnswer())
                .quizId(question.getQuiz() != null ? question.getQuiz().getId() : null)
                .options(options)
                .build();
    }
}
