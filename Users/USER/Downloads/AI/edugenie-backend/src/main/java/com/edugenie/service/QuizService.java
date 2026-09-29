package com.edugenie.service;

import com.edugenie.request.QuizRequest;
import com.edugenie.response.QuizResponse;

import java.util.List;

public interface QuizService {

    QuizResponse createQuiz(QuizRequest request, String email);

    List<QuizResponse> getAllQuizzes();

    QuizResponse getQuizById(Long quizId);

    QuizResponse updateQuiz(Long quizId, QuizRequest request, String email);

    void deleteQuiz(Long quizId, String email);
}
