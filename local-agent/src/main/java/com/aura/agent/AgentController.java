
package com.aura.agent;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.HashMap;
@RestController
@RequestMapping("/agent")
public class AgentController {

    private final ApplicationLauncher launcher;
    private final WhatsAppBrowserService whatsAppBrowserService;

    @Value("${cygnus.agent.token}")
    private String agentToken;

   public AgentController(
        ApplicationLauncher launcher,
        WhatsAppBrowserService whatsAppBrowserService) {

    this.launcher = launcher;
    this.whatsAppBrowserService = whatsAppBrowserService;
}

    @PostMapping("/open")
    public Map<String, String> openApplication(
            @RequestHeader(value = "Authorization", required = false)
            String authorization,
            @RequestBody Map<String, String> request) {

        if (authorization == null ||
                !MessageDigest.isEqual(
                        ("Bearer " + agentToken).getBytes(StandardCharsets.UTF_8),
                        authorization.getBytes(StandardCharsets.UTF_8))) {

            return Map.of(
                    "status", "ERROR",
                    "message", "Unauthorized request"
            );
        }

        String applicationName = request.get("application");

        if (applicationName == null || applicationName.isBlank()) {
            return Map.of(
                    "status", "ERROR",
                    "message", "Application name is required"
            );
        }

        boolean success = launcher.openApplication(applicationName);

        if (success) {
            return Map.of(
                    "status", "SUCCESS",
                    "message", applicationName + " opened successfully"
            );
        }

        return Map.of(
                "status", "ERROR",
                "message", "Application is not allowed or could not be opened"
        );
    }

@PostMapping("/website")
public Map<String, String> openWebsite(
        @RequestHeader(value = "Authorization", required = false)
        String authorization,
        @RequestBody Map<String, String> request) {

    if (authorization == null ||
            !MessageDigest.isEqual(
                    ("Bearer " + agentToken).getBytes(StandardCharsets.UTF_8),
                    authorization.getBytes(StandardCharsets.UTF_8))) {

        return Map.of(
                "status", "ERROR",
                "message", "Unauthorized request"
        );
    }

    String url = request.get("url");

    if (url == null || url.isBlank()) {
        return Map.of(
                "status", "ERROR",
                "message", "Website URL is required"
        );
    }

    boolean success = launcher.openWebsite(url);

    if (success) {
        return Map.of(
                "status", "SUCCESS",
                "message", "Website opened successfully"
        );
    }

    return Map.of(
            "status", "ERROR",
            "message", "Invalid website URL or could not open website"
    );
}

@PostMapping("/create-file")
public Map<String, String> createFile(
        @RequestHeader(value = "Authorization", required = false)
        String authorization,
        @RequestBody Map<String, String> request) {

    if (authorization == null ||
            !MessageDigest.isEqual(
                    ("Bearer " + agentToken).getBytes(StandardCharsets.UTF_8),
                    authorization.getBytes(StandardCharsets.UTF_8))) {

        return Map.of(
                "status", "ERROR",
                "message", "Unauthorized request"
        );
    }

    String fileName = request.get("fileName");
    String content = request.get("content");

    if (fileName == null || fileName.isBlank()) {
        return Map.of(
                "status", "ERROR",
                "message", "File name is required"
        );
    }

    boolean success = launcher.createTextFile(fileName, content);

    if (success) {
        return Map.of(
                "status", "SUCCESS",
                "message", "File created and opened in Notepad successfully"
        );
    }

    return Map.of(
            "status", "ERROR",
            "message", "File could not be created or opened"
    );
}


@PostMapping("/create-project")
public Map<String, String> createProject(
        @RequestHeader(value = "Authorization", required = false)
        String authorization,
        @RequestBody Map<String, Object> request) {

    if (authorization == null ||
            !MessageDigest.isEqual(
                    ("Bearer " + agentToken).getBytes(StandardCharsets.UTF_8),
                    authorization.getBytes(StandardCharsets.UTF_8))) {

        return Map.of(
                "status", "ERROR",
                "message", "Unauthorized request"
        );
    }

    String projectName = request.get("projectName") instanceof String
            ? (String) request.get("projectName")
            : null;

    Object filesObject = request.get("files");

    if (projectName == null || projectName.isBlank()) {
        return Map.of("status", "ERROR", "message", "Project name is required");
    }

    if (!(filesObject instanceof Map<?, ?>)) {
        return Map.of("status", "ERROR", "message", "Project files are required");
    }

    Map<String, String> files = new HashMap<>();

    for (Map.Entry<?, ?> entry : ((Map<?, ?>) filesObject).entrySet()) {

        if (!(entry.getKey() instanceof String) ||
                !(entry.getValue() instanceof String)) {

            return Map.of("status", "ERROR", "message", "Invalid project file details");
        }

        files.put((String) entry.getKey(), (String) entry.getValue());
    }

    boolean success = launcher.createProject(projectName, files);

    if (success) {
        return Map.of(
                "status", "SUCCESS",
                "message", "Project created and opened in VS Code successfully"
        );
    }

    return Map.of(
            "status", "ERROR",
            "message", "Project could not be created"
    );
}
@PostMapping("/whatsapp/open")
public Map<String, String> openWhatsApp(
        @RequestHeader(value = "Authorization", required = false)
        String authorization) {

    if (authorization == null ||
            !MessageDigest.isEqual(
                    ("Bearer " + agentToken).getBytes(StandardCharsets.UTF_8),
                    authorization.getBytes(StandardCharsets.UTF_8))) {

        return Map.of(
                "status", "ERROR",
                "message", "Unauthorized request"
        );
    }

    String result = whatsAppBrowserService.openWhatsAppWeb();

    return Map.of(
            "message", result
    );
}

@PostMapping("/whatsapp/prepare")
public Map<String, String> prepareWhatsAppMessage(
        @RequestHeader(value = "Authorization", required = false)
        String authorization,
        @RequestBody Map<String, String> request) {

    if (authorization == null ||
            !MessageDigest.isEqual(
                    ("Bearer " + agentToken).getBytes(StandardCharsets.UTF_8),
                    authorization.getBytes(StandardCharsets.UTF_8))) {

        return Map.of(
                "status", "ERROR",
                "message", "Unauthorized request"
        );
    }

    String phoneNumber = request.get("phoneNumber");
    String messageText = request.get("messageText");

    if (phoneNumber == null || phoneNumber.isBlank()) {
        return Map.of(
                "status", "ERROR",
                "message", "Phone number is required"
        );
    }

    if (messageText == null || messageText.isBlank()) {
        return Map.of(
                "status", "ERROR",
                "message", "Message cannot be empty"
        );
    }

    String result = whatsAppBrowserService.prepareWhatsAppMessage(
            phoneNumber,
            messageText
    );

    return Map.of(
            "message", result
    );
}

@PostMapping("/whatsapp/verify")
public Map<String, String> verifyWhatsAppRecipient(
        @RequestHeader(value = "Authorization", required = false)
        String authorization,
        @RequestBody Map<String, String> request) {

    if (authorization == null ||
            !MessageDigest.isEqual(
                    ("Bearer " + agentToken).getBytes(StandardCharsets.UTF_8),
                    authorization.getBytes(StandardCharsets.UTF_8))) {

        return Map.of(
                "status", "ERROR",
                "message", "Unauthorized request"
        );
    }

    String recipientName = request.get("recipientName");
    String phoneNumber = request.get("phoneNumber");

    if (recipientName == null || recipientName.isBlank()) {
        return Map.of("status", "ERROR", "message", "Recipient name is required");
    }

    if (phoneNumber == null || phoneNumber.isBlank()) {
        return Map.of("status", "ERROR", "message", "Phone number is required");
    }

    String result = whatsAppBrowserService.testRecipientVerification(
            recipientName,
            phoneNumber
    );

    return Map.of("message", result);
}
@PostMapping("/whatsapp/send")
public Map<String, String> sendWhatsAppMessage(
        @RequestHeader(value = "Authorization", required = false)
        String authorization,
        @RequestBody Map<String, String> request) {

    if (authorization == null ||
            !MessageDigest.isEqual(
                    ("Bearer " + agentToken).getBytes(StandardCharsets.UTF_8),
                    authorization.getBytes(StandardCharsets.UTF_8))) {

        return Map.of(
                "status", "ERROR",
                "message", "Unauthorized request"
        );
    }

    String recipientName = request.get("recipientName");
    String phoneNumber = request.get("phoneNumber");
    String messageText = request.get("messageText");
    String requestId = request.get("requestId");
   if (requestId == null || requestId.isBlank()) {
    return Map.of(
            "status", "ERROR",
            "message", "Request ID is required"
    );
}

    if (recipientName == null || recipientName.isBlank()) {
        return Map.of(
                "status", "ERROR",
                "message", "Recipient name is required"
        );
    }

    if (phoneNumber == null || phoneNumber.isBlank()) {
        return Map.of(
                "status", "ERROR",
                "message", "Phone number is required"
        );
    }

    if (messageText == null || messageText.isBlank()) {
        return Map.of(
                "status", "ERROR",
                "message", "Message cannot be empty"
        );
    }

  String result = whatsAppBrowserService.sendWhatsAppMessage(
        requestId,
        recipientName,
        phoneNumber,
        messageText
);
   
    return Map.of(
            "message", result
    );
}



}
