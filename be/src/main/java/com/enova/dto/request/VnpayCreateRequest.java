package com.enova.dto.request;

import lombok.Data;

@Data
public class VnpayCreateRequest {
    private Long amount;
    private String orderInfo;
    private String bankCode;
}
