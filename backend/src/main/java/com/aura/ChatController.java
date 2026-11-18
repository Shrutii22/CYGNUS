
package com.aura;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/{conversationId}/chat")
    public Map<String, Object> chat(
            @PathVariable Long conversationId,
            @RequestBody ChatRequest request) {

        return chatService.chat(
                conversationId,
                request.getMessage()
        );
    }
}
