package com.edugenie.service;

import com.edugenie.request.AiAssistantRequest;
import com.edugenie.response.AiAssistantResponse;

public interface AiService {

    String generateAnswer(AiAssistantRequest request);

    AiAssistantResponse generateQuiz(AiAssistantRequest request);

    AiAssistantResponse generateStudyNotes(AiAssistantRequest request);

    AiAssistantResponse generateInterviewQuestions(AiAssistantRequest request);

    AiAssistantResponse summarizeContent(AiAssistantRequest request);

    default String generateText(String prompt) {
        throw new UnsupportedOperationException("generateText is not supported by this AI provider");
    }
}
