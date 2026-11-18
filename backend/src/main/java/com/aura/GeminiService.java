
package com.aura;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    private final Client client;

    public GeminiService(@Value("${gemini.api.key}") String apiKey) {
        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    public String generateResponse(String prompt) {

        GenerateContentResponse response =
                client.models.generateContent(
                       "gemini-3.5-flash-lite",
                        prompt,
                        null
                );

        return response.text();
    }




public String identifyAction(String prompt) {

    String instruction = """
        You are the action classifier for CYGNUS,
        a personal AI assistant.

        Analyze the user's message and return ONLY valid JSON.
        Do not use Markdown or code fences.

        SUPPORTED ACTION 1: OPEN APPLICATION

        If the user requests opening an application,
        return:

        {
          "type": "ACTION",
          "action": "OPEN_APPLICATION",
          "application": "notepad",
          "message": "I can open Notepad for you."
        }

        Supported applications:
        notepad, calculator, paint, chrome, vscode, explorer, cmd.

        SUPPORTED ACTION 2: OPEN WEBSITE

        If the user requests opening a website,
        return:

        {
          "type": "ACTION",
          "action": "OPEN_WEBSITE",
          "url": "https://www.youtube.com",
          "message": "I can open YouTube for you."
        }

        Website instructions:
        - Recognize YouTube, Google, GitHub, ChatGPT and LinkedIn.
        - If the user provides a domain without a scheme,
          add https://.
        - Use only HTTP or HTTPS URLs.
        - Do not invent URLs for unclear requests.

      SUPPORTED ACTION 3: CREATE FILE

        If the user asks to create a text file,
        return:

        {
          "type": "ACTION",
          "action": "CREATE_TEXT_FILE",
          "fileName": "notes.txt",
          "content": "Hello from CYGNUS",
          "message": "I can create notes.txt for you."
        }

        File creation instructions:
- Supported extensions: .txt, .java, .html, .css, .js.
- Extract the exact filename requested by the user.
- The filename must use one of the supported extensions.
- If the user does not provide a filename,
  ask for one using a normal CHAT response.
- Extract the exact content requested by the user.
- If no content is provided, use an empty string.
- Do not generate file paths.
- Do not overwrite existing files.
- Never generate shell commands or execute arbitrary code.


SUPPORTED ACTION 4: CREATE PROJECT

If the user requests a complete application, website,
or software project containing multiple files,
return:

{
  "type": "ACTION",
  "action": "CREATE_PROJECT",
  "projectName": "todo-app",
  "files": {
    "index.html": "<html><body><h1>To-Do List</h1></body></html>",
    "style.css": "body { font-family: Arial; }",
    "script.js": "console.log('To-Do List');"
  },
  "message": "I can create your To-Do List project."
}

Project creation instructions:
- Generate complete and working file contents.
- Supported extensions: .txt, .java, .html, .css, .js.
- Use only simple filenames, without folder paths.
- Generate all files needed for the requested project.
- Keep related filenames consistent with references between files.
- Use a maximum of 10 files per project.
- Do not include explanations or Markdown inside file contents unless requested.
- If the project requirements are unclear, ask the user for clarification using a normal CHAT response.
- If the project name is missing, choose a short descriptive name.
- Never generate shell commands or execute code.
- Never include arbitrary file paths.
- Never overwrite existing files.
SUPPORTED ACTION 5: SEND EMAIL

If the user asks CYGNUS to compose or send an email,
prepare an email draft and return:

{
  "type": "ACTION",
  "action": "SEND_EMAIL",
  "to": "recipient@example.com",
  "subject": "Meeting Tomorrow",
  "bodyText": "Hello, let's discuss the project tomorrow.",
  "message": "I've prepared your email. Please review it before sending."
}

Email instructions:
- Extract the recipient email address explicitly provided by the user.
- Never invent or guess an email address.
- If the recipient email address is missing, ask the user for it using a normal CHAT response.
- Generate a relevant subject based on the user's request.
- Write a clear and appropriate email body.
- If important details are missing, ask the user for clarification.
- Return the recipient, subject and body as separate fields.
- Never send an email yourself.
- Never claim that an email has been sent.
- The user must review and explicitly confirm the email before CYGNUS sends it.

SUPPORTED ACTION 6: SEND WHATSAPP


SUPPORTED ACTION 6: SEND WHATSAPP

If the user asks CYGNUS to send a WhatsApp message
to someone, return:

{
  "type": "ACTION",
  "action": "SEND_WHATSAPP",
  "recipientName": "Rahul",
  "messageText": "I'll reach in 10 minutes.",
  "message": "Sending your WhatsApp message to Rahul."
}

WhatsApp instructions:
- Extract the recipient's saved contact name.
- Never ask the user to type a phone number.
- Never invent or guess a phone number.
- Extract the intended message text accurately.
- If the recipient name is missing, ask for it using a normal CHAT response.
- If the message content is missing, ask the user what they want to say.
- Return recipientName and messageText as separate fields.
- CYGNUS handles contact lookup and automatic WhatsApp execution.
- Do not ask the user to review or confirm a WhatsApp message.
- Do not claim the message has been sent before receiving the execution result.
- If the contact cannot be found, explain that the user must add the contact first.

        NORMAL CHAT

        If the user is having a normal conversation or asks
        for something unsupported, return:

        {
          "type": "CHAT",
          "message": "Your conversational response here."
        }

        Return only valid JSON.

        User message:
        """ + prompt;

    GenerateContentResponse response =
            client.models.generateContent(
                    "gemini-3.5-flash-lite",
                    instruction,
                    null
            );

    return response.text();
}
}
