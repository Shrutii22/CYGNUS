package com.aura;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
@RestController
@RequestMapping("/api/gmail")
public class GmailController {

    private final GmailService gmailService;

    public GmailController(GmailService gmailService) {
        this.gmailService = gmailService;
    }
@PostMapping("/send")
public ResponseEntity<?> sendEmail(
        @RequestBody SendEmailRequest request) {

    if (request.to() == null
            || !request.to().matches(
                "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {

        return ResponseEntity.badRequest().body(
                java.util.Map.of(
                        "status", "ERROR",
                        "message", "Invalid recipient email address."
                )
        );
    }

    if (request.subject() == null
            || request.subject().isBlank()
            || request.subject().length() > 200
            || request.subject().contains("\r")
            || request.subject().contains("\n")) {

        return ResponseEntity.badRequest().body(
                java.util.Map.of(
                        "status", "ERROR",
                        "message", "Invalid email subject."
                )
        );
    }

    if (request.bodyText() == null
            || request.bodyText().isBlank()
            || request.bodyText().length() > 10000) {

        return ResponseEntity.badRequest().body(
                java.util.Map.of(
                        "status", "ERROR",
                        "message", "Invalid email body."
                )
        );
    }

    try {

        String messageId = gmailService.sendEmail(
                request.to().trim(),
                request.subject().trim(),
                request.bodyText()
        );

        return ResponseEntity.ok(
                java.util.Map.of(
                        "status", "SUCCESS",
                        "message", "Email sent successfully!",
                        "messageId", messageId
                )
        );

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity.internalServerError().body(
                java.util.Map.of(
                        "status", "ERROR",
                        "message", "Failed to send email."
                )
        );
    }
}
public record SendEmailRequest(
        String to,
        String subject,
        String bodyText
) {}
    
}