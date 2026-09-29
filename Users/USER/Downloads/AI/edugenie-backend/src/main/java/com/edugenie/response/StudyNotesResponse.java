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
public class StudyNotesResponse {

    private String topic;
    private String overview;
    private List<String> importantConcepts;
    private List<String> keyPoints;
    private List<String> examples;
    private List<String> commonMistakes;
    private List<String> interviewQuestions;
    private String shortRevisionNotes;
}
