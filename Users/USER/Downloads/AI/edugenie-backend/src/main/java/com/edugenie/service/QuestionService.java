package com.edugenie.service;

import com.edugenie.request.QuestionRequest;
import com.edugenie.response.QuestionResponse;

import java.util.List;

public interface QuestionService {

    QuestionResponse createQuestion(Long quizId, QuestionRequest request, String email);

    List<QuestionResponse> getQuestionsByQuiz(Long quizId);
}
