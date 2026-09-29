package com.edugenie.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiQuizQuestionResponse {

    private String question;
    private List<String> options;
    private String correctAnswer;
    private String explanation;
}
