package com.enova.controller;

import com.enova.dto.request.VnpayCreateRequest;
import com.enova.dto.response.ApiResponse;
import com.enova.model.PaymentTransaction;
import com.enova.model.User;
import com.enova.service.UserService;
import com.enova.service.VnpayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/vnpay")
@RequiredArgsConstructor
public class PaymentController {

    private final VnpayService vnpayService;
    private final UserService userService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Map<String, String>>> createPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody VnpayCreateRequest request,
            HttpServletRequest httpRequest) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        PaymentTransaction tx = vnpayService.createTransaction(user, request.getAmount());
        String ip = httpRequest.getRemoteAddr();
        String url = vnpayService.createPaymentUrl(tx, request.getOrderInfo(), request.getBankCode(), ip);
        return ResponseEntity.ok(ApiResponse.success(Map.of("paymentUrl", url, "orderRef", tx.getOrderRef())));
    }

    @GetMapping("/ipn")
    public ResponseEntity<ApiResponse<String>> ipn(@RequestParam Map<String, String> params) {
        Map<String, String> copy = new HashMap<>(params);
        boolean valid = vnpayService.validateSignature(copy);
        String orderRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        boolean success = "00".equals(responseCode);
        if (valid && orderRef != null) {
            vnpayService.markTransaction(orderRef, success);
            return ResponseEntity.ok(ApiResponse.success("OK"));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error("Invalid signature"));
    }
}
