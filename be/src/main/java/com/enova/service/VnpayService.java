package com.enova.service;

import com.enova.model.PaymentTransaction;
import com.enova.model.User;
import com.enova.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VnpayService {

    private final PaymentTransactionRepository paymentRepository;

    @Value("${vnpay.tmn-code:}")
    private String tmnCode;

    @Value("${vnpay.hash-secret:}")
    private String hashSecret;

    @Value("${vnpay.pay-url:}")
    private String payUrl;

    @Value("${vnpay.return-url:}")
    private String returnUrl;

    public PaymentTransaction createTransaction(User user, long amount) {
        String ref = "ENOVA" + System.currentTimeMillis();
        PaymentTransaction transaction = PaymentTransaction.builder()
                .user(user)
                .amount(amount)
                .currency("VND")
                .provider("VNPAY")
                .orderRef(ref)
                .status(PaymentTransaction.PaymentStatus.PENDING)
                .build();
        return paymentRepository.save(transaction);
    }

    public String createPaymentUrl(PaymentTransaction transaction, String orderInfo, String bankCode, String clientIp) {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", String.valueOf(transaction.getAmount() * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", transaction.getOrderRef());
        params.put("vnp_OrderInfo", orderInfo == null ? "ENOVA Subscription" : orderInfo);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", clientIp);
        params.put("vnp_CreateDate", LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"))
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        if (bankCode != null && !bankCode.isBlank()) {
            params.put("vnp_BankCode", bankCode);
        }

        String query = buildQuery(params);
        String hashData = buildHashData(params);
        String secureHash = hmacSha512(hashSecret, hashData);
        return payUrl + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    public boolean validateSignature(Map<String, String> params) {
        String secureHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");
        String hashData = buildHashData(params);
        String computed = hmacSha512(hashSecret, hashData);
        return computed.equalsIgnoreCase(secureHash);
    }

    public void markTransaction(String orderRef, boolean success) {
        paymentRepository.findByOrderRef(orderRef).ifPresent(tx -> {
            tx.setStatus(success ? PaymentTransaction.PaymentStatus.SUCCESS : PaymentTransaction.PaymentStatus.FAILED);
            tx.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(tx);
        });
    }

    private String buildQuery(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > 0) sb.append("&");
            sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII));
            sb.append("=");
            sb.append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
        }
        return sb.toString();
    }

    private String buildHashData(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > 0) sb.append("&");
            sb.append(entry.getKey());
            sb.append("=");
            sb.append(entry.getValue());
        }
        return sb.toString();
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("Cannot sign VNPAY request", ex);
        }
    }
}
