package com.edugenie.service;

import com.edugenie.request.QuizAttemptRequest;
import com.edugenie.response.QuizAttemptResponse;

import java.util.List;

public interface QuizAttemptService {

    QuizAttemptResponse submitQuiz(Long quizId, QuizAttemptRequest request, String email);

    List<QuizAttemptResponse> getMyAttempts(String email);

    QuizAttemptResponse getAttemptById(Long attemptId, String email);
}
