package com.edugenie.service.impl;

import com.edugenie.exception.ApiException;
import com.edugenie.repository.UserRepository;
import com.edugenie.request.StudyNotesRequest;
import com.edugenie.response.StudyNotesResponse;
import com.edugenie.service.AiService;
import com.edugenie.service.StudyNotesService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyNotesServiceImpl implements StudyNotesService {

    private final UserRepository userRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper;

    @Override
    public StudyNotesResponse generateStudyNotes(StudyNotesRequest request, String email) {
        if (request == null) {
            throw new ApiException("Invalid request: study notes request is required");
        }

        String topic = request.getTopic();
        if (topic == null || topic.isBlank()) {
            throw new ApiException("Invalid request: topic is required");
        }

        String cleanedTopic = topic.trim();
        if (cleanedTopic.length() < 2) {
            throw new ApiException("Invalid request: topic is too short");
        }

        userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        String prompt = buildStudyNotesPrompt(cleanedTopic);
        String rawAiResponse = aiService.generateText(prompt);

        if (rawAiResponse == null || rawAiResponse.isBlank()) {
            throw new ApiException("Gemini returned an empty response");
        }

        return parseGeneratedStudyNotes(rawAiResponse, cleanedTopic);
    }

    private String buildStudyNotesPrompt(String topic) {
        return "You are EduGenie, a helpful educational study assistant. " +
                "Generate high-quality study notes for the topic: " + topic + ". " +
                "Return valid JSON only and nothing else. " +
                "The JSON must match this schema exactly: " +
                "{ \"topic\": \"string\", \"overview\": \"string\", " +
                "\"importantConcepts\": [\"string\", \"string\"], " +
                "\"keyPoints\": [\"string\", \"string\"], " +
                "\"examples\": [\"string\", \"string\"], " +
                "\"commonMistakes\": [\"string\", \"string\"], " +
                "\"interviewQuestions\": [\"string\", \"string\"], " +
                "\"shortRevisionNotes\": \"string\" }. " +
                "The output must be educational, concise, and beginner-friendly. " +
                "The overview must explain the topic clearly. " +
                "Important concepts, key points, examples, common mistakes, and interview questions must be realistic and useful for learning and interviews. " +
                "Do not include markdown fences or commentary outside JSON.";
    }

    private StudyNotesResponse parseGeneratedStudyNotes(String rawResponse, String topic) {
        try {
            JsonNode root = objectMapper.readTree(cleanJson(rawResponse));

            if (root == null || !root.isObject()) {
                throw new ApiException("Gemini response was malformed: invalid JSON object");
            }

            String overview = requireText(root, "overview");
            List<String> importantConcepts = requireStringList(root, "importantConcepts");
            List<String> keyPoints = requireStringList(root, "keyPoints");
            List<String> examples = requireStringList(root, "examples");
            List<String> commonMistakes = requireStringList(root, "commonMistakes");
            List<String> interviewQuestions = requireStringList(root, "interviewQuestions");
            String shortRevisionNotes = requireText(root, "shortRevisionNotes");

            return StudyNotesResponse.builder()
                    .topic(topic)
                    .overview(overview)
                    .importantConcepts(importantConcepts)
                    .keyPoints(keyPoints)
                    .examples(examples)
                    .commonMistakes(commonMistakes)
                    .interviewQuestions(interviewQuestions)
                    .shortRevisionNotes(shortRevisionNotes)
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

    private String requireText(JsonNode root, String fieldName) {
        JsonNode field = root.get(fieldName);
        if (field == null || field.isNull() || field.asText() == null || field.asText().isBlank()) {
            throw new ApiException("Gemini response is missing or invalid: " + fieldName);
        }
        return field.asText().trim();
    }

    private List<String> requireStringList(JsonNode root, String fieldName) {
        JsonNode field = root.get(fieldName);
        if (field == null || !field.isArray() || field.isEmpty()) {
            throw new ApiException("Gemini response is missing or invalid: " + fieldName);
        }

        List<String> items = new ArrayList<>();
        for (JsonNode item : field) {
            if (item == null || item.isNull() || item.asText() == null || item.asText().isBlank()) {
                throw new ApiException("Gemini response contains a blank item in: " + fieldName);
            }
            items.add(item.asText().trim());
        }

        return items;
    }
}
