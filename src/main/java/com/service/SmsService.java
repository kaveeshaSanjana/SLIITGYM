package com.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    @Value("${smslenz.user-id}")
    private String userId;

    @Value("${smslenz.api-key}")
    private String apiKey;

    @Value("${smslenz.sender-id}")
    private String senderId;

    private static final String SMS_API_URL = "https://smslenz.lk/api/send-sms";
    private final RestTemplate restTemplate;

    public SmsService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Sends an SMS asynchronously using the smslenz.lk API.
     * 
     * @param contact The recipient's phone number in the format +9476XXXXXXX
     * @param message The message to send (Max 621 chars)
     */
    public void sendSms(String contact, String message) {
        if (contact == null || contact.trim().isEmpty()) {
            logger.warn("Cannot send SMS: Contact number is empty.");
            return;
        }
        
        if (message != null && message.length() > 621) {
            message = message.substring(0, 621);
            logger.warn("SMS message was truncated because it exceeded 621 characters.");
        }

        final String finalMessage = message;

        // Run asynchronously so it doesn't block the API response
        CompletableFuture.runAsync(() -> {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, String> payload = new HashMap<>();
                payload.put("user_id", userId);
                payload.put("api_key", apiKey);
                payload.put("sender_id", senderId);
                payload.put("contact", contact);
                payload.put("message", finalMessage);

                HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);

                ResponseEntity<String> response = restTemplate.postForEntity(SMS_API_URL, request, String.class);

                if (response.getStatusCode().is2xxSuccessful()) {
                    logger.info("Successfully sent SMS to {}. Response: {}", contact, response.getBody());
                } else {
                    logger.error("Failed to send SMS to {}. Status: {}, Response: {}", contact, response.getStatusCode(), response.getBody());
                }

            } catch (Exception e) {
                logger.error("Exception occurred while sending SMS to {}: {}", contact, e.getMessage(), e);
            }
        });
    }
}
