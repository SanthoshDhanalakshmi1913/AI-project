package com.edugenie.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptRequest {

    @NotEmpty(message = "Submitted answers are required")
    private List<StudentAnswerRequest> answers;
}
