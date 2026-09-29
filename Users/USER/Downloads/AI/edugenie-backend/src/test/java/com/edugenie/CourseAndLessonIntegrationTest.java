package com.edugenie;

import com.edugenie.entity.Role;
import com.edugenie.repository.UserRepository;
import com.edugenie.request.CourseRequest;
import com.edugenie.request.LessonRequest;
import com.edugenie.request.RegisterRequest;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CourseAndLessonIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatModel chatModel;

    private String instructorToken;
    private String studentToken;
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        instructorToken = getOrRegisterToken("Instructor Course", "inst_course_" + System.currentTimeMillis() + "@test.com", Role.INSTRUCTOR);
        studentToken = getOrRegisterToken("Student Course", "stud_course_" + System.currentTimeMillis() + "@test.com", Role.STUDENT);
        // Admin is seeded by DataInitializer
        adminToken = loginUser("admin@edugenie.com", "admin123");
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

    private String loginUser(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new com.edugenie.request.LoginRequest(email, password))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("token").asText();
    }

    @Test
    @DisplayName("Student should be forbidden from creating a course")
    void testStudentCannotCreateCourse() throws Exception {
        CourseRequest request = new CourseRequest("Hacking 101", "Unauthorized", "Security", "Beginner");

        mockMvc.perform(post("/api/courses")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Instructor should create, read, update, and delete course with lessons")
    void testCompleteCourseAndLessonLifecycle() throws Exception {
        // 1. Create Course
        CourseRequest createCourseReq = new CourseRequest("Deep Learning with PyTorch", "Hands-on neural networks", "AI", "Advanced");
        MvcResult courseResult = mockMvc.perform(post("/api/courses")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createCourseReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Deep Learning with PyTorch"))
                .andReturn();

        long courseId = objectMapper.readTree(courseResult.getResponse().getContentAsString()).get("data").get("id").asLong();

        // 2. Read Course by ID
        mockMvc.perform(get("/api/courses/" + courseId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(courseId));

        // 3. Read All Courses
        mockMvc.perform(get("/api/courses")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        // 4. Update Course
        CourseRequest updateCourseReq = new CourseRequest("Deep Learning with PyTorch v2", "Updated curriculum", "AI", "Advanced");
        mockMvc.perform(put("/api/courses/" + courseId)
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateCourseReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Deep Learning with PyTorch v2"));

        // 5. Add Lesson 1
        LessonRequest lesson1Req = new LessonRequest("Tensors & Operations", "Fundamental building blocks in PyTorch", 1);
        MvcResult lessonResult = mockMvc.perform(post("/api/courses/" + courseId + "/lessons")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lesson1Req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Tensors & Operations"))
                .andReturn();

        long lessonId = objectMapper.readTree(lessonResult.getResponse().getContentAsString()).get("data").get("id").asLong();

        // 6. Prevent Duplicate Lesson Order
        mockMvc.perform(post("/api/courses/" + courseId + "/lessons")
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lesson1Req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("A lesson with this order already exists for the course"));

        // 7. Get Lessons for Course
        mockMvc.perform(get("/api/courses/" + courseId + "/lessons")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        // 8. Update Lesson
        LessonRequest updateLessonReq = new LessonRequest("Tensors & Autograd", "Updated tensor content", 1);
        mockMvc.perform(put("/api/lessons/" + lessonId)
                        .header("Authorization", "Bearer " + instructorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateLessonReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Tensors & Autograd"));

        // 9. Delete Lesson
        mockMvc.perform(delete("/api/lessons/" + lessonId)
                        .header("Authorization", "Bearer " + instructorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Lesson deleted successfully"));

        // 10. Delete Course by Admin
        mockMvc.perform(delete("/api/courses/" + courseId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Course deleted successfully"));
    }
}
