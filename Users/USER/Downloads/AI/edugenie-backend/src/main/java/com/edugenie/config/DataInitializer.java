package com.edugenie.config;

import com.edugenie.entity.*;
import com.edugenie.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Initializing baseline EduGenie seed data...");

        User admin = seedUser("EduGenie Admin", "admin@edugenie.com", "admin123", Role.ADMIN);
        User instructor = seedUser("Dr. Sarah Connor", "instructor@edugenie.com", "instructor123", Role.INSTRUCTOR);
        User student = seedUser("Alex Rivera", "student@edugenie.com", "student123", Role.STUDENT);

        if (courseRepository.count() == 0) {
            seedCoursesAndQuizzes(instructor);
        }

        log.info("EduGenie seed data ready.");
    }

    private User seedUser(String name, String email, String rawPassword, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            return userRepository.save(user);
        });
    }

    private void seedCoursesAndQuizzes(User instructor) {
        Course course1 = new Course();
        course1.setTitle("Enterprise Java & Spring Boot Masterclass");
        course1.setDescription("Deep dive into modern Spring Boot 3, REST APIs, Spring Security, and JPA development.");
        course1.setCategory("Computer Science");
        course1.setLevel("Intermediate");
        course1.setInstructor(instructor);
        course1 = courseRepository.save(course1);

        Lesson l1 = new Lesson();
        l1.setTitle("Spring Boot Architecture & Inversion of Control");
        l1.setContent("Spring Boot simplifies dependency injection using Spring IoC container. Components are managed as beans with lifecycle callbacks.");
        l1.setLessonOrder(1);
        l1.setCourse(course1);
        lessonRepository.save(l1);

        Lesson l2 = new Lesson();
        l2.setTitle("Securing APIs with JWT and Spring Security 6");
        l2.setContent("Stateless authentication utilizes JSON Web Tokens signed with HMAC-SHA256, verified on each incoming request via a custom filter.");
        l2.setLessonOrder(2);
        l2.setCourse(course1);
        lessonRepository.save(l2);

        Quiz quiz1 = new Quiz();
        quiz1.setTitle("Spring Boot & REST Architecture Assessment");
        quiz1.setDescription("Test your knowledge of Spring core principles, annotations, and API security.");
        quiz1.setCourse(course1);
        quiz1 = quizRepository.save(quiz1);

        seedQuestion(quiz1,
                "What is the primary role of the Inversion of Control (IoC) container in Spring?",
                "Managing bean lifecycle and injecting dependencies",
                List.of("Compiling Java source code into bytecode",
                        "Managing bean lifecycle and injecting dependencies",
                        "Executing database migrations automatically",
                        "Serving HTML templates directly to browser"));

        seedQuestion(quiz1,
                "Which annotation in Spring Boot is used to mark a class as a REST controller?",
                "@RestController",
                List.of("@Controller",
                        "@Service",
                        "@RestController",
                        "@ComponentRepository"));

        seedQuestion(quiz1,
                "How does stateless authentication typically verify user identity?",
                "By validating a signed JWT token on each request",
                List.of("By creating a server-side HTTP session",
                        "By storing the password in cleartext in cookies",
                        "By validating a signed JWT token on each request",
                        "By querying Active Directory on every database call"));

        // Course 2
        Course course2 = new Course();
        course2.setTitle("Generative AI & LLM Engineering");
        course2.setDescription("Practical guide to building intelligent tutoring systems, prompt engineering, and LLM integrations.");
        course2.setCategory("Artificial Intelligence");
        course2.setLevel("Advanced");
        course2.setInstructor(instructor);
        course2 = courseRepository.save(course2);

        Lesson l21 = new Lesson();
        l21.setTitle("Prompt Engineering & Few-Shot Prompting");
        l21.setContent("Designing precise instructions, providing output schemas, and supplying structured few-shot examples produce deterministic outputs.");
        l21.setLessonOrder(1);
        l21.setCourse(course2);
        lessonRepository.save(l21);

        Quiz quiz2 = new Quiz();
        quiz2.setTitle("AI & LLM Integration Fundamentals");
        quiz2.setDescription("Evaluate your understanding of prompt design, LLM parameters, and API integration.");
        quiz2.setCourse(course2);
        quiz2 = quizRepository.save(quiz2);

        seedQuestion(quiz2,
                "What parameter controls the randomness of an LLM generation?",
                "Temperature",
                List.of("Temperature",
                        "Batch size",
                        "Epochs",
                        "Learning rate"));

        seedQuestion(quiz2,
                "Which technique provides examples within the prompt to guide the model's response format?",
                "Few-shot prompting",
                List.of("Zero-shot learning",
                        "Few-shot prompting",
                        "Gradient descent",
                        "Quantization"));
    }

    private void seedQuestion(Quiz quiz, String text, String correct, List<String> options) {
        Question q = new Question();
        q.setQuiz(quiz);
        q.setQuestionText(text);
        q.setCorrectAnswer(correct);
        q = questionRepository.save(q);

        for (String optText : options) {
            QuizOption opt = new QuizOption();
            opt.setQuestion(q);
            opt.setOptionText(optText);
            quizOptionRepository.save(opt);
        }
    }
}
