package com.edugenie.service.impl;

import com.edugenie.exception.ApiException;
import com.edugenie.repository.UserRepository;
import com.edugenie.request.AiQuizRequest;
import com.edugenie.response.AiQuizQuestionResponse;
import com.edugenie.response.AiQuizResponse;
import com.edugenie.service.AiQuizService;
import com.edugenie.service.AiService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiQuizServiceImpl implements AiQuizService {

    private final UserRepository userRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper;

    @Override
    public AiQuizResponse generateQuiz(AiQuizRequest request, String email) {
        if (request == null) {
            throw new ApiException("Invalid request: quiz generation request is required");
        }

        if (request.getTopic() == null || request.getTopic().isBlank()) {
            throw new ApiException("Invalid request: topic is required");
        }

        if (request.getDifficulty() == null || request.getDifficulty().isBlank()) {
            throw new ApiException("Invalid request: difficulty is required");
        }

        if (request.getNumberOfQuestions() == null || request.getNumberOfQuestions() < 1 || request.getNumberOfQuestions() > 20) {
            throw new ApiException("Invalid request: numberOfQuestions must be between 1 and 20");
        }

        userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        String prompt = buildQuizGenerationPrompt(request);
        String rawAiResponse = aiService.generateText(prompt);

        if (rawAiResponse == null || rawAiResponse.isBlank()) {
            throw new ApiException("Gemini returned an empty response");
        }

        AiQuizResponse parsedQuiz = parseGeneratedQuiz(rawAiResponse, request);
        return parsedQuiz;
    }

    private String buildQuizGenerationPrompt(AiQuizRequest request) {
        return "You are EduGenie, an educational quiz generator for learners. " +
                "Generate exactly " + request.getNumberOfQuestions() + " multiple-choice questions on the topic: " + request.getTopic() + ". " +
                "Difficulty: " + request.getDifficulty() + ". " +
                "Each question must include: question, options, correctAnswer, and explanation. " +
                "The response must be valid JSON only and must match this schema exactly: " +
                "{ \"topic\": \"string\", \"difficulty\": \"string\", \"numberOfQuestions\": number, \"questions\": [ { \"question\": \"string\", \"options\": [\"string\", \"string\", \"string\", \"string\"], \"correctAnswer\": \"string\", \"explanation\": \"string\" } ] }. " +
                "The options must be four choices, exactly one correct answer, and the correctAnswer must match one of the options exactly. " +
                "Make the quiz educational, clear, and accurate. Ensure the explanation teaches the concept. " +
                "Do not include markdown fences or any extra text outside the JSON.";
    }

    private AiQuizResponse parseGeneratedQuiz(String rawResponse, AiQuizRequest request) {
        try {
            JsonNode root = objectMapper.readTree(cleanJson(rawResponse));
            if (root == null || !root.has("questions") || !root.get("questions").isArray()) {
                throw new ApiException("Gemini response was malformed: missing questions array");
            }

            JsonNode questionsNode = root.get("questions");
            if (questionsNode.size() != request.getNumberOfQuestions()) {
                throw new ApiException("Gemini response question count does not match request: expected " + request.getNumberOfQuestions());
            }

            List<AiQuizQuestionResponse> questions = new ArrayList<>();

            for (JsonNode questionNode : questionsNode) {
                if (!questionNode.has("question") || !questionNode.has("options") || !questionNode.has("correctAnswer") || !questionNode.has("explanation")) {
                    throw new ApiException("Gemini response contains an invalid question object");
                }

                JsonNode optionsNode = questionNode.get("options");
                if (!optionsNode.isArray() || optionsNode.size() != 4) {
                    throw new ApiException("Each generated question must contain exactly four options");
                }

                List<String> options = new ArrayList<>();
                for (JsonNode optionNode : optionsNode) {
                    String optionText = optionNode.asText();
                    if (optionText == null || optionText.isBlank()) {
                        throw new ApiException("A generated answer option is blank");
                    }
                    options.add(optionText.trim());
                }

                String questionText = questionNode.get("question").asText();
                String correctAnswer = questionNode.get("correctAnswer").asText();
                String explanation = questionNode.get("explanation").asText();

                if (questionText == null || questionText.isBlank()) {
                    throw new ApiException("A generated question text is blank");
                }
                if (correctAnswer == null || correctAnswer.isBlank() || !options.contains(correctAnswer.trim())) {
                    throw new ApiException("Correct answer is missing or does not match one of the options");
                }
                if (explanation == null || explanation.isBlank()) {
                    throw new ApiException("A generated question explanation is blank");
                }

                questions.add(AiQuizQuestionResponse.builder()
                        .question(questionText.trim())
                        .options(options)
                        .correctAnswer(correctAnswer.trim())
                        .explanation(explanation.trim())
                        .build());
            }

            return AiQuizResponse.builder()
                    .topic(request.getTopic().trim())
                    .difficulty(request.getDifficulty().trim())
                    .numberOfQuestions(request.getNumberOfQuestions())
                    .questions(questions)
                    .build();
        } catch (JsonProcessingException e) {
            throw new ApiException("Gemini response was not valid JSON: " + e.getOriginalMessage());
        }
    }

    private String cleanJson(String raw) {
        if (raw == null) return "";
        String cleaned = raw.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }
}
