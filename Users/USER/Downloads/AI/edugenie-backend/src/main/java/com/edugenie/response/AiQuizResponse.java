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
public class AiQuizResponse {

    private String topic;
    private String difficulty;
    private Integer numberOfQuestions;
    private List<AiQuizQuestionResponse> questions;
}
