package com.edugenie.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttemptResponse {

    private Long id;
    private Long userId;
    private Long quizId;
    private Integer score;
    private Integer totalQuestions;
    private Integer percentage;
    private Boolean passed;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private List<StudentAnswerResponse> answers;
}
