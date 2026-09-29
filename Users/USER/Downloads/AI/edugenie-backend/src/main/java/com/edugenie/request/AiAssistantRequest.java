package com.edugenie.request;

import com.edugenie.util.AiTaskType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAssistantRequest {

    @NotBlank(message = "Prompt is required")
    private String prompt;

    private String topic;

    private String context;

    private String difficulty;

    private Integer numberOfQuestions;

    private AiTaskType taskType;
}
