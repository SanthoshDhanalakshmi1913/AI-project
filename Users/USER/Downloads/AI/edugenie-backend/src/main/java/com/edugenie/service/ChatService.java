package com.edugenie.service;

import com.edugenie.request.ChatRequest;
import com.edugenie.response.ChatHistoryResponse;
import com.edugenie.response.ChatResponse;

import java.util.List;

public interface ChatService {

    ChatResponse askQuestion(ChatRequest request, String email);

    List<ChatHistoryResponse> getChatHistory(String email);
}
