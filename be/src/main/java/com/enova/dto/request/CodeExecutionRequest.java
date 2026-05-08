package com.enova.dto.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class CodeExecutionRequest {
    private String language;
    private String code;
    private String input;
}
