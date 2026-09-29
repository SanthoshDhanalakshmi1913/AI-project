package com.edugenie.service.impl;

import com.edugenie.entity.ChatConversation;
import com.edugenie.entity.ChatMessage;
import com.edugenie.entity.User;
import com.edugenie.exception.ApiException;
import com.edugenie.repository.ChatConversationRepository;
import com.edugenie.repository.ChatMessageRepository;
import com.edugenie.repository.UserRepository;
import com.edugenie.request.ChatRequest;
import com.edugenie.response.ChatHistoryResponse;
import com.edugenie.response.ChatResponse;
import com.edugenie.service.AiService;
import com.edugenie.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final UserRepository userRepository;
    private final ChatConversationRepository chatConversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AiService aiService;

    @Override
    @Transactional
    public ChatResponse askQuestion(ChatRequest request, String email) {
        if (request == null || request.getMessage() == null || request.getMessage().isBlank()) {
            throw new ApiException("Invalid request: message is required");
        }

        String cleanedMessage = request.getMessage().trim();
        if (cleanedMessage.length() < 3) {
            throw new ApiException("Invalid request: message is too short");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        String promptText = buildLearningAssistantPrompt(cleanedMessage);

        String aiAnswer = aiService.generateText(promptText);

        ChatConversation conversation = chatConversationRepository.findByUserOrderByUpdatedAtDesc(user).stream()
                .findFirst()
                .orElseGet(() -> {
                    ChatConversation newConversation = new ChatConversation();
                    newConversation.setUser(user);
                    newConversation.setTopic("Learning Assistant");
                    return chatConversationRepository.save(newConversation);
                });

        ChatMessage userMessage = new ChatMessage();
        userMessage.setConversation(conversation);
        userMessage.setRole("USER");
        userMessage.setContent(cleanedMessage);
        chatMessageRepository.save(userMessage);

        ChatMessage aiMessage = new ChatMessage();
        aiMessage.setConversation(conversation);
        aiMessage.setRole("AI");
        aiMessage.setContent(aiAnswer);
        chatMessageRepository.save(aiMessage);

        conversation.setTopic(extractTopic(cleanedMessage));
        conversation.setUpdatedAt(LocalDateTime.now());
        chatConversationRepository.save(conversation);

        return ChatResponse.builder()
                .question(cleanedMessage)
                .answer(aiAnswer)
                .build();
    }

    @Override
    public List<ChatHistoryResponse> getChatHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        List<ChatConversation> conversations = chatConversationRepository.findByUserOrderByUpdatedAtDesc(user);
        List<ChatHistoryResponse> history = new ArrayList<>();

        for (ChatConversation conversation : conversations) {
            List<ChatMessage> messages = chatMessageRepository.findByConversationOrderByCreatedAtAsc(conversation);
            if (messages.isEmpty()) {
                continue;
            }

            String lastQuestion = messages.stream()
                    .filter(m -> "USER".equalsIgnoreCase(m.getRole()))
                    .reduce((first, second) -> second)
                    .map(ChatMessage::getContent)
                    .orElse("");

            String lastAnswer = messages.stream()
                    .filter(m -> "AI".equalsIgnoreCase(m.getRole()))
                    .reduce((first, second) -> second)
                    .map(ChatMessage::getContent)
                    .orElse("");

            if (!lastQuestion.isBlank() && !lastAnswer.isBlank()) {
                history.add(ChatHistoryResponse.builder()
                        .conversationId(conversation.getId())
                        .question(lastQuestion)
                        .answer(lastAnswer)
                        .createdAt(conversation.getCreatedAt())
                        .build());
            }
        }

        return history;
    }

    private String buildLearningAssistantPrompt(String question) {
        return "You are EduGenie, a friendly educational learning assistant. " +
                "Answer the student's question in a clear, structured, and beginner-friendly way. " +
                "Use step-by-step explanations when helpful, define key concepts, and provide examples. " +
                "If the topic is technical, explain it in simple language and relate it to practical learning. " +
                "Keep the answer focused on learning, not just raw facts. " +
                "Format the response with headings or short sections such as 'Concept', 'How it works', 'Example', and 'Key takeaway'. " +
                "Student question: " + question;
    }

    private String extractTopic(String question) {
        if (question == null || question.isBlank()) {
            return "Learning Assistant";
        }
        String trimmed = question.trim();
        return trimmed.length() > 40 ? trimmed.substring(0, 40).trim() + "..." : trimmed;
    }
}
