package com.edugenie.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAnswerResponse {

    private Long id;
    private Long attemptId;
    private Long questionId;
    private String questionText;
    private String correctAnswer;
    private String selectedAnswer;
    private Boolean isCorrect;
}
