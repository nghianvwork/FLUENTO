package com.enova.dto.response;

import com.enova.model.CodeExecution;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeExecutionResponse {
    private Long id;
    private String language;
    private String code;
    private String input;
    private String output;
    private String error;
    private Integer executionTime;
    private String status;
    private LocalDateTime createdAt;

    public static CodeExecutionResponse from(CodeExecution execution) {
        return CodeExecutionResponse.builder()
                .id(execution.getId())
                .language(execution.getLanguage())
                .code(execution.getCode())
                .input(execution.getInput())
                .output(execution.getOutput())
                .error(execution.getError())
                .executionTime(execution.getExecutionTime())
                .status(execution.getStatus().name())
                .createdAt(execution.getCreatedAt())
                .build();
    }
}
