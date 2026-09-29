package com.edugenie;

import com.edugenie.entity.Role;
import com.edugenie.request.AiQuizRequest;
import com.edugenie.request.ChatRequest;
import com.edugenie.request.RegisterRequest;
import com.edugenie.request.StudyNotesRequest;
import com.edugenie.service.AiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AiServicesIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AiService aiService;

    private String studentToken;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest request = new RegisterRequest("AI Learner", "ai_learner_" + System.currentTimeMillis() + "@test.com", "password123", Role.STUDENT);
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        studentToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("token").asText();
    }

    @Test
    @DisplayName("Should ask AI question in Chat and retrieve history")
    void testAiChatFlow() throws Exception {
        when(aiService.generateText(anyString())).thenReturn("Polymorphism allows objects to be treated as instances of their parent class.");

        ChatRequest chatRequest = new ChatRequest("Explain polymorphism in Object-Oriented Programming");

        mockMvc.perform(post("/api/chat")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(chatRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.question").value("Explain polymorphism in Object-Oriented Programming"))
                .andExpect(jsonPath("$.data.answer").value("Polymorphism allows objects to be treated as instances of their parent class."));

        // Retrieve chat history
        mockMvc.perform(get("/api/chat/history")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    @DisplayName("Should reject too short chat message")
    void testAiChatTooShortMessage() throws Exception {
        ChatRequest chatRequest = new ChatRequest("Hi");

        mockMvc.perform(post("/api/chat")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(chatRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid request: message is too short"));
    }

    @Test
    @DisplayName("Should generate AI Quiz on a topic even when wrapped in markdown fences")
    void testGenerateAiQuizWithMarkdownCleaning() throws Exception {
        String mockQuizJson = "```json\n" +
                "{\n" +
                "  \"topic\": \"Recursion\",\n" +
                "  \"difficulty\": \"EASY\",\n" +
                "  \"numberOfQuestions\": 1,\n" +
                "  \"questions\": [\n" +
                "    {\n" +
                "      \"question\": \"What is the base case in recursion?\",\n" +
                "      \"options\": [\"Condition that terminates recursion\", \"The first loop condition\", \"A memory overflow\", \"The recursive call itself\"],\n" +
                "      \"correctAnswer\": \"Condition that terminates recursion\",\n" +
                "      \"explanation\": \"The base case prevents infinite recursive calls and stack overflow.\"\n" +
                "    }\n" +
                "  ]\n" +
                "}\n" +
                "```";

        when(aiService.generateText(anyString())).thenReturn(mockQuizJson);

        AiQuizRequest request = new AiQuizRequest("Recursion", "EASY", 1);

        mockMvc.perform(post("/api/ai/quiz/generate")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.topic").value("Recursion"))
                .andExpect(jsonPath("$.data.questions[0].correctAnswer").value("Condition that terminates recursion"));
    }

    @Test
    @DisplayName("Should generate AI Study Notes on a topic even when wrapped in markdown fences")
    void testGenerateAiStudyNotesWithMarkdownCleaning() throws Exception {
        String mockNotesJson = "```json\n" +
                "{\n" +
                "  \"topic\": \"Microservices\",\n" +
                "  \"overview\": \"Microservices architecture structures an application as a collection of loosely coupled services.\",\n" +
                "  \"importantConcepts\": [\"Service Discovery\", \"API Gateway\"],\n" +
                "  \"keyPoints\": [\"Independent deployment\", \"Decentralized data\"],\n" +
                "  \"examples\": [\"Spring Cloud Eureka for service discovery\"],\n" +
                "  \"commonMistakes\": [\"Creating distributed monoliths without proper boundary context\"],\n" +
                "  \"interviewQuestions\": [\"How do microservices communicate synchronously vs asynchronously?\"],\n" +
                "  \"shortRevisionNotes\": \"Microservices offer resilience and scaling at the cost of distributed complexity.\"\n" +
                "}\n" +
                "```";

        when(aiService.generateText(anyString())).thenReturn(mockNotesJson);

        StudyNotesRequest request = new StudyNotesRequest("Microservices");

        mockMvc.perform(post("/api/ai/study-notes")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.topic").value("Microservices"))
                .andExpect(jsonPath("$.data.importantConcepts[0]").value("Service Discovery"))
                .andExpect(jsonPath("$.data.interviewQuestions[0]").exists());
    }

    @Test
    @DisplayName("Should reject blank topic for AI Quiz generation")
    void testAiQuizBlankTopic() throws Exception {
        AiQuizRequest request = new AiQuizRequest("", "EASY", 5);

        mockMvc.perform(post("/api/ai/quiz/generate")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
