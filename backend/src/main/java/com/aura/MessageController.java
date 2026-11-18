package com.aura;

import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations/{conversationId}/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    public Message saveMessage(
            @PathVariable Long conversationId,
            @RequestBody Message message) {

        return messageService.saveMessage(
                conversationId,
                message.getRole(),
                message.getContent()
        );
    }

    @GetMapping
    public List<Message> getMessages(@PathVariable Long conversationId) {
        return messageService.getMessages(conversationId);
    }
}