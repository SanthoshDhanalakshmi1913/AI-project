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
public class AiAssistantResponse {

    private String taskType;
    private String answer;
    private String topic;
    private Integer numberOfQuestions;
    private List<String> questions;
    private List<String> studyNotes;
    private List<String> interviewQuestions;
    private String summary;
}
