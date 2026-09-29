package com.edugenie.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProgressResponse {

    private Integer coursesEnrolled;
    private Integer coursesCompleted;
    private Double averageQuizScore;
    private Long lessonsCompleted;
    private Integer overallProgress;
    private Long quizAttempts;
    private Long aiQuestionsAsked;
    private Long courseId;
    private String courseTitle;
}
