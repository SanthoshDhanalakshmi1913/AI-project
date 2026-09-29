package com.edugenie.service.impl;

import com.edugenie.exception.ApiException;
import com.edugenie.request.AiAssistantRequest;
import com.edugenie.response.AiAssistantResponse;
import com.edugenie.service.AiService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GeminiAiServiceImpl implements AiService {

    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    @Override
    public String generateAnswer(AiAssistantRequest request) {
        validateRequest(request);
        String taskDescription = switch (request.getTaskType()) {
            case EXPLAIN -> "Explain the topic clearly, define important concepts, and answer the question in a learner-friendly way.";
            case EXAMPLES -> "Provide clear examples and practical use cases for the topic.";
            case SIMPLIFY -> "Simplify the explanation in very easy-to-understand language while preserving accuracy.";
            case FOLLOW_UP -> "Answer the follow-up question using the previous context and continue the learning discussion naturally.";
            default -> "Explain the topic clearly, give examples, and answer the question in a learner-friendly way.";
        };
        String prompt = buildInstructionPrompt(request, taskDescription);
        return callGemini(prompt);
    }

    @Override
    public String generateText(String prompt) {
        return callGemini(prompt);
    }

    @Override
    public AiAssistantResponse generateQuiz(AiAssistantRequest request) {
        validateRequest(request);
        if (request.getNumberOfQuestions() == null || request.getNumberOfQuestions() < 1 || request.getNumberOfQuestions() > 20) {
            throw new ApiException("Invalid request: numberOfQuestions must be between 1 and 20");
        }

        String prompt = buildInstructionPrompt(request,
                "Generate exactly " + request.getNumberOfQuestions() + " quiz questions in valid JSON. " +
                        "Return {\"questions\":[\"question1\",\"question2\",...],\"topic\":\"...\"}." );

        String rawResponse = callGemini(prompt);
        return parseListResponse(rawResponse, "quiz", request.getTopic());
    }

    @Override
    public AiAssistantResponse generateStudyNotes(AiAssistantRequest request) {
        validateRequest(request);
        String prompt = buildInstructionPrompt(request,
                "Generate structured study notes in valid JSON. Return {\"studyNotes\":[\"note1\",\"note2\", ...],\"topic\":\"...\"}." );
        String rawResponse = callGemini(prompt);
        return parseListResponse(rawResponse, "studyNotes", request.getTopic());
    }

    @Override
    public AiAssistantResponse generateInterviewQuestions(AiAssistantRequest request) {
        validateRequest(request);
        String prompt = buildInstructionPrompt(request,
                "Generate interview-style questions and answers in valid JSON. Return {\"interviewQuestions\":[\"question1\",\"question2\", ...],\"topic\":\"...\"}." );
        String rawResponse = callGemini(prompt);
        return parseListResponse(rawResponse, "interviewQuestions", request.getTopic());
    }

    @Override
    public AiAssistantResponse summarizeContent(AiAssistantRequest request) {
        validateRequest(request);
        String prompt = buildInstructionPrompt(request,
                "Summarize the content in a concise, readable, and structured way. Return valid JSON with a single field \"summary\" and the topic.");
        String rawResponse = callGemini(prompt);
        return parseSummaryResponse(rawResponse, request.getTopic());
    }

    private void validateRequest(AiAssistantRequest request) {
        if (request == null) {
            throw new ApiException("Invalid request: AI request is required");
        }

        String topic = request.getTopic();
        if ((request.getPrompt() == null || request.getPrompt().isBlank()) && (topic == null || topic.isBlank())) {
            throw new ApiException("Invalid request: either prompt or topic is required");
        }

        if (request.getTaskType() == null) {
            request.setTaskType(com.edugenie.util.AiTaskType.FOLLOW_UP);
        }
    }

    private String buildInstructionPrompt(AiAssistantRequest request, String taskInstruction) {
        String topic = request.getTopic() != null ? request.getTopic() : "the provided topic";
        String context = request.getContext() != null ? request.getContext() : "No extra context provided.";
        String prompt = request.getPrompt() != null ? request.getPrompt() : "Explain " + topic;
        String difficulty = request.getDifficulty() != null ? request.getDifficulty() : "beginner";

        return "You are EduGenie, a helpful AI learning assistant for students. " +
                taskInstruction + " " +
                "Topic: " + topic + ". " +
                "Difficulty level: " + difficulty + ". " +
                "User request: " + prompt + ". " +
                "Context: " + context + ". " +
                "Keep the answer accurate, educational, concise, and beginner-friendly. " +
                "Use plain language and examples when helpful. " +
                "Return valid JSON only and no markdown fences or text outside the JSON.";
    }

    private String callGemini(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new ApiException("Invalid request: prompt is required");
        }

        String apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            throw new ApiException("Gemini API key is missing. Set the GEMINI_API_KEY environment variable.");
        }

        try {
            return chatModel.call(new Prompt(prompt)).getResult().getOutput().getText();
        } catch (Exception ex) {
            if (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("timeout")) {
                throw new ApiException("Gemini API request timed out. Please try again.");
            }
            throw new ApiException("Gemini API failure: " + ex.getMessage());
        }
    }

    private AiAssistantResponse parseListResponse(String rawResponse, String type, String topic) {
        try {
            JsonNode root = objectMapper.readTree(cleanJson(rawResponse));
            JsonNode targetNode = root.has(type) ? root.get(type) : root;

            List<String> items = new ArrayList<>();
            if (targetNode != null && targetNode.isArray()) {
                for (JsonNode item : targetNode) {
                    if (item != null && !item.isNull() && !item.asText().isBlank()) {
                        items.add(item.asText().trim());
                    }
                }
            }

            if (items.isEmpty()) {
                throw new ApiException("Gemini response was malformed: no valid content was returned");
            }

            AiAssistantResponse response = new AiAssistantResponse();
            response.setTaskType(type);
            response.setTopic(topic);
            response.setAnswer("AI-generated " + type + " created successfully.");

            if ("quiz".equals(type)) {
                response.setQuestions(items);
            } else if ("studyNotes".equals(type)) {
                response.setStudyNotes(items);
            } else if ("interviewQuestions".equals(type)) {
                response.setInterviewQuestions(items);
            }

            return response;
        } catch (JsonProcessingException e) {
            throw new ApiException("Gemini response was not valid JSON: " + e.getOriginalMessage());
        }
    }

    private AiAssistantResponse parseSummaryResponse(String rawResponse, String topic) {
        try {
            JsonNode root = objectMapper.readTree(cleanJson(rawResponse));
            String summary = null;

            if (root.has("summary")) {
                summary = root.get("summary").asText();
            } else if (root.has("content")) {
                summary = root.get("content").asText();
            } else {
                summary = root.asText();
            }

            if (summary == null || summary.isBlank()) {
                throw new ApiException("Gemini response was malformed: missing summary");
            }

            AiAssistantResponse response = new AiAssistantResponse();
            response.setTaskType("SUMMARIZE");
            response.setTopic(topic);
            response.setSummary(summary.trim());
            response.setAnswer(summary.trim());
            return response;
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
