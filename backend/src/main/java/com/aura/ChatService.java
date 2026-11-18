
package com.aura;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;


import java.util.Map;

@Service
public class ChatService {

    private final GeminiService geminiService;
    private final MessageService messageService;
    private final ObjectMapper objectMapper= new ObjectMapper();
     private final ContactService contactService;
   public ChatService(
        GeminiService geminiService,
        MessageService messageService,
        ContactService contactService
) {

    this.geminiService = geminiService;
    this.messageService = messageService;
    this.contactService = contactService;
}

    public Map<String, Object> chat(Long conversationId, String userPrompt) {

        messageService.saveMessage(conversationId, "user", userPrompt);

        try {
            String aiResponse = geminiService.identifyAction(userPrompt);

            Map<String, Object> decision =
                    objectMapper.readValue(aiResponse, Map.class);

            String type = String.valueOf(decision.get("type"));
            String message = String.valueOf(decision.get("message"));

            if ("ACTION".equals(type)
                    && "OPEN_APPLICATION".equals(decision.get("action"))) {

                String application =
                        String.valueOf(decision.get("application"));

               if (!Map.of(
        "notepad", true,
        "calculator", true,
        "paint", true,
        "chrome", true,
        "vscode", true,
        "explorer", true,
        "cmd", true
).containsKey(application)) {
                    return chatResponse(
                            conversationId,
                            "I cannot perform that application action yet."
                    );
                }

                messageService.saveMessage(
                        conversationId, "assistant", message
                );

                return Map.of(
                        "type", "ACTION",
                        "action", "OPEN_APPLICATION",
                        "application", application,
                        "message", message
                );
            }

if ("ACTION".equals(type)
        && "OPEN_WEBSITE".equals(decision.get("action"))) {

    Object urlValue = decision.get("url");

    if (!(urlValue instanceof String) ||
            ((String) urlValue).isBlank()) {

        return chatResponse(
                conversationId,
                "I couldn't identify a valid website."
        );
    }

    String url = ((String) urlValue).trim();

    messageService.saveMessage(
            conversationId,
            "assistant",
            message
    );

    return Map.of(
            "type", "ACTION",
            "action", "OPEN_WEBSITE",
            "url", url,
            "message", message
    );
}

if ("ACTION".equals(type)
        && "CREATE_TEXT_FILE".equals(decision.get("action"))) {

    Object fileNameValue = decision.get("fileName");
    Object contentValue = decision.get("content");

    if (!(fileNameValue instanceof String)) {
        return chatResponse(
                conversationId,
                "Please provide a valid text filename."
        );
    }

    String fileName = ((String) fileNameValue).trim();

   if (!fileName.matches("(?i)[a-z0-9][a-z0-9._ -]*\\.(txt|java|html|css|js)")) {
    return chatResponse(
            conversationId,
            "Please provide a valid filename ending in .txt, .java, .html, .css, or .js."
    );
}

    if (contentValue != null && !(contentValue instanceof String)) {
        return chatResponse(
                conversationId,
                "The file content must be text."
        );
    }

    String content = contentValue == null
            ? ""
            : (String) contentValue;

    messageService.saveMessage(
            conversationId,
            "assistant",
            message
    );

    return Map.of(
            "type", "ACTION",
            "action", "CREATE_TEXT_FILE",
            "fileName", fileName,
            "content", content,
            "message", message
    );
}

if ("ACTION".equals(type)
        && "CREATE_PROJECT".equals(decision.get("action"))) {

    Object projectNameValue = decision.get("projectName");
    Object filesValue = decision.get("files");

    if (!(projectNameValue instanceof String)) {
        return chatResponse(
                conversationId,
                "Please provide a valid project name."
        );
    }

    String projectName = ((String) projectNameValue).trim();

    if (!projectName.matches("[a-zA-Z0-9][a-zA-Z0-9._ -]*")
            || projectName.length() > 50) {

        return chatResponse(
                conversationId,
                "The project name contains invalid characters."
        );
    }

    if (!(filesValue instanceof Map<?, ?>)) {
        return chatResponse(
                conversationId,
                "I couldn't generate valid project files."
        );
    }

    Map<?, ?> rawFiles = (Map<?, ?>) filesValue;

    if (rawFiles.isEmpty() || rawFiles.size() > 10) {
        return chatResponse(
                conversationId,
                "A project must contain between 1 and 10 files."
        );
    }

    Map<String, String> projectFiles = new java.util.LinkedHashMap<>();

    for (Map.Entry<?, ?> entry : rawFiles.entrySet()) {

        if (!(entry.getKey() instanceof String)
                || !(entry.getValue() instanceof String)) {

            return chatResponse(
                    conversationId,
                    "Invalid project file details."
            );
        }

        String fileName = (String) entry.getKey();
        String content = (String) entry.getValue();

        if (!fileName.equals(fileName.trim())
                || !fileName.matches("(?i)[a-z0-9][a-z0-9._ -]*\\.(txt|java|html|css|js)")) {

            return chatResponse(
                    conversationId,
                    "One of the project filenames is invalid."
            );
        }

        projectFiles.put(fileName, content);
    }

    messageService.saveMessage(
            conversationId,
            "assistant",
            message
    );

    return Map.of(
            "type", "ACTION",
            "action", "CREATE_PROJECT",
            "projectName", projectName,
            "files", projectFiles,
            "message", message
    );
}
if ("ACTION".equals(type)
        && "SEND_EMAIL".equals(decision.get("action"))) {

    Object toValue = decision.get("to");
    Object subjectValue = decision.get("subject");
    Object bodyValue = decision.get("bodyText");

    if (!(toValue instanceof String)
            || !(subjectValue instanceof String)
            || !(bodyValue instanceof String)) {

        return chatResponse(
                conversationId,
                "I couldn't prepare a valid email draft."
        );
    }

    String to = ((String) toValue).trim();
    String subject = ((String) subjectValue).trim();
    String bodyText = (String) bodyValue;

    if (!to.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
            || subject.isBlank()
            || subject.length() > 200
            || bodyText.isBlank()
            || bodyText.length() > 10000) {

        return chatResponse(
                conversationId,
                "The email details are invalid. Please review your recipient, subject and message."
        );
    }

    messageService.saveMessage(
            conversationId,
            "assistant",
            message
    );

    return Map.of(
            "type", "ACTION",
            "action", "SEND_EMAIL",
            "to", to,
            "subject", subject,
            "bodyText", bodyText,
            "message", message
    );
}
if ("ACTION".equals(type)
        && "SEND_WHATSAPP".equals(decision.get("action"))) {

    Object recipientValue = decision.get("recipientName");
    Object messageTextValue = decision.get("messageText");

    if (!(recipientValue instanceof String)
            || !(messageTextValue instanceof String)) {

        return chatResponse(
                conversationId,
                "I couldn't prepare a valid WhatsApp message."
        );
    }

    String recipientName = ((String) recipientValue).trim();
    String messageText = (String) messageTextValue;

    if (recipientName.isBlank()
            || recipientName.length() > 100
            || messageText.isBlank()
            || messageText.length() > 4000) {

        return chatResponse(
                conversationId,
                "The WhatsApp recipient or message is invalid."
        );
    }

    var contacts = contactService.findContactsByName(recipientName);

    if (contacts.isEmpty()) {

        return chatResponse(
                conversationId,
                "I couldn't find " + recipientName
                        + " in your saved contacts. Please add the contact first."
        );
    }

    if (contacts.size() > 1) {

        return chatResponse(
                conversationId,
                "I found multiple contacts named " + recipientName
                        + ". Please make their names distinguishable in your contacts."
        );
    }

    Contact contact = contacts.get(0);

    messageService.saveMessage(
            conversationId,
            "assistant",
            message
    );

    return Map.of(
            "type", "ACTION",
            "action", "SEND_WHATSAPP",
            "contactId", contact.getId(),
            "recipientName", contact.getName(),
            "phoneNumber", contact.getPhoneNumber(),
            "messageText", messageText,
            "message", message
    );
}
            return chatResponse(conversationId, message);


        } catch (Exception e) {

            return chatResponse(
                    conversationId,
                    "I couldn't process that request. Please try again."
            );
        }
    }

    private Map<String, Object> chatResponse(
            Long conversationId, String message) {

        messageService.saveMessage(
                conversationId, "assistant", message
        );

        return Map.of(
                "type", "CHAT",
                "message", message
        );
    }
}
