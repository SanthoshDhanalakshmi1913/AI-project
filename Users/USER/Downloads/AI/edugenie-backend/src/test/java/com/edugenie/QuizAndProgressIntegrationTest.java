package com.edugenie;

import com.edugenie.entity.Role;
import com.edugenie.request.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class QuizAndProgressIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatModel chatModel;

    private String instructorToken;
    private String studentToken;
    private long courseId;

    @BeforeEach
    void setUp() throws Exception {
        instructorToken = getOrRegisterToken("Instructor Quiz", "inst_quiz_" + System.currentTimeMillis() + "@test.com", Role.INSTRUCTOR);
        studentToken = getOrRegisterToken("Student Quiz", "stud_quiz_" + System.currentTimeMillis() + "@test.com", Role.STUDENT);

        // Create a course
        CourseRequest courseReq = new CourseRequest("Algorithms & Data Structures", "DSA course", "Computer Science", "Intermediate");
        MvcResult res = mockMvc.perform(post("/api/courses")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(courseReq)))
                .andExpect(status().isCreated())
                .andReturn();
        courseId = objectMapper.readTree(res.getResponse().getContentAsString()).get("data").get("id").asLong();

        // Create a lesson
        LessonRequest lessonReq = new LessonRequest("Binary Trees", "Tree traversals and balance", 1);
        mockMvc.perform(post("/api/courses/" + courseId + "/lessons")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lessonReq)))
                .andExpect(status().isCreated());
    }

    private String getOrRegisterToken(String name, String email, Role role) throws Exception {
        RegisterRequest request = new RegisterRequest(name, email, "password123", role);
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("token").asText();
    }

    @Test
    @DisplayName("Should successfully execute Quiz CRUD, Question creation, Quiz Submission, and Scoring")
    void testQuizSubmissionAndScoringFlow() throws Exception {
        // 1. Create Quiz
        QuizRequest quizReq = new QuizRequest("Trees & Graphs Quiz", "Test on BST and graphs", courseId);
        MvcResult quizRes = mockMvc.perform(post("/api/quizzes")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(quizReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Trees & Graphs Quiz"))
                .andReturn();

        long quizId = objectMapper.readTree(quizRes.getResponse().getContentAsString()).get("data").get("id").asLong();

        // 2. Add Question 1
        QuestionRequest q1 = new QuestionRequest(
                "What is the average time complexity of searching in a balanced BST?",
                "O(log n)",
                List.of(
                        new QuizOptionRequest("O(1)"),
                        new QuizOptionRequest("O(log n)"),
                        new QuizOptionRequest("O(n)"),
                        new QuizOptionRequest("O(n log n)")
                )
        );
        MvcResult q1Res = mockMvc.perform(post("/api/quizzes/" + quizId + "/questions")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(q1)))
                .andExpect(status().isCreated())
                .andReturn();
        long q1Id = objectMapper.readTree(q1Res.getResponse().getContentAsString()).get("data").get("id").asLong();

        // 3. Add Question 2
        QuestionRequest q2 = new QuestionRequest(
                "Which graph traversal algorithm uses a queue?",
                "BFS",
                List.of(
                        new QuizOptionRequest("DFS"),
                        new QuizOptionRequest("BFS"),
                        new QuizOptionRequest("Dijkstra"),
                        new QuizOptionRequest("Prim")
                )
        );
        MvcResult q2Res = mockMvc.perform(post("/api/quizzes/" + quizId + "/questions")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(q2)))
                .andExpect(status().isCreated())
                .andReturn();
        long q2Id = objectMapper.readTree(q2Res.getResponse().getContentAsString()).get("data").get("id").asLong();

        // 4. Student gets questions for the quiz
        mockMvc.perform(get("/api/quizzes/" + quizId + "/questions")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));

        // 5. Student submits quiz with 2 correct answers (100% score, passed = true)
        QuizAttemptRequest attemptReq1 = new QuizAttemptRequest(List.of(
                new StudentAnswerRequest(q1Id, "O(log n)"),
                new StudentAnswerRequest(q2Id, "BFS")
        ));

        MvcResult attemptRes1 = mockMvc.perform(post("/api/quizzes/" + quizId + "/attempt")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(attemptReq1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.score").value(2))
                .andExpect(jsonPath("$.data.totalQuestions").value(2))
                .andExpect(jsonPath("$.data.percentage").value(100))
                .andExpect(jsonPath("$.data.passed").value(true))
                .andExpect(jsonPath("$.data.answers[0].questionText").value("What is the average time complexity of searching in a balanced BST?"))
                .andExpect(jsonPath("$.data.answers[0].correctAnswer").value("O(log n)"))
                .andReturn();

        long attemptId1 = objectMapper.readTree(attemptRes1.getResponse().getContentAsString()).get("data").get("id").asLong();

        // 6. Student submits quiz with 1 wrong answer (50% score)
        QuizAttemptRequest attemptReq2 = new QuizAttemptRequest(List.of(
                new StudentAnswerRequest(q1Id, "O(1)"),
                new StudentAnswerRequest(q2Id, "BFS")
        ));

        mockMvc.perform(post("/api/quizzes/" + quizId + "/attempt")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(attemptReq2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.score").value(1))
                .andExpect(jsonPath("$.data.totalQuestions").value(2))
                .andExpect(jsonPath("$.data.percentage").value(50))
                .andExpect(jsonPath("$.data.passed").value(true));

        // 7. Student retrieves their attempts history
        mockMvc.perform(get("/api/quiz-attempts/my")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));

        // 8. Student retrieves specific attempt by ID
        mockMvc.perform(get("/api/quiz-attempts/" + attemptId1)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(attemptId1))
                .andExpect(jsonPath("$.data.score").value(2));

        // 9. Student retrieves progress dashboard metrics
        mockMvc.perform(get("/api/progress/my")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.quizAttempts").value(2))
                .andExpect(jsonPath("$.data.coursesEnrolled").isNumber())
                .andExpect(jsonPath("$.data.averageQuizScore").isNumber());

        // 10. Student retrieves course-specific progress
        mockMvc.perform(get("/api/progress/course/" + courseId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.courseId").value(courseId))
                .andExpect(jsonPath("$.data.overallProgress").isNumber());
    }

    @Test
    @DisplayName("Should reject empty quiz answers")
    void testRejectEmptyAnswers() throws Exception {
        QuizRequest quizReq = new QuizRequest("Empty Quiz Test", "No questions", courseId);
        MvcResult quizRes = mockMvc.perform(post("/api/quizzes")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(quizReq)))
                .andExpect(status().isCreated())
                .andReturn();

        long quizId = objectMapper.readTree(quizRes.getResponse().getContentAsString()).get("data").get("id").asLong();

        QuizAttemptRequest emptyReq = new QuizAttemptRequest(List.of());
        mockMvc.perform(post("/api/quizzes/" + quizId + "/attempt")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyReq)))
                .andExpect(status().isBadRequest());
    }
}
