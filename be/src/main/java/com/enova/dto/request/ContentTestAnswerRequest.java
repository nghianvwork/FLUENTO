package com.enova.dto.request;

import lombok.Data;
import java.util.Map;

@Data
public class ContentTestAnswerRequest {
    private Map<Long, String> answers;
    private Integer timeSpent;
}
