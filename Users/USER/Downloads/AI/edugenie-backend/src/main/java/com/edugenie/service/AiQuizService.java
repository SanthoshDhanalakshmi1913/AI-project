package com.edugenie.service;

import com.edugenie.request.AiQuizRequest;
import com.edugenie.response.AiQuizResponse;

public interface AiQuizService {

    AiQuizResponse generateQuiz(AiQuizRequest request, String email);
}
