package com.aura;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.auth.oauth2.Credential;

import org.springframework.stereotype.Service;

@Service
public class GmailService {

    private final GoogleAuthorizationCodeFlow authorizationCodeFlow;

    public GmailService(
            GoogleAuthorizationCodeFlow authorizationCodeFlow) {

        this.authorizationCodeFlow = authorizationCodeFlow;
    }
    private Gmail getGmailClient() throws Exception {

    NetHttpTransport httpTransport =
            GoogleNetHttpTransport.newTrustedTransport();

    Credential credential =
            authorizationCodeFlow.loadCredential("user");

    if (credential == null) {
        throw new IllegalStateException(
                "Gmail is not connected. Please connect Gmail first."
        );
    }

    return new Gmail.Builder(
            httpTransport,
            GsonFactory.getDefaultInstance(),
            credential
    )
            .setApplicationName("CYGNUS")
            .build();
}
private Message createEmailMessage(
        String to,
        String subject,
        String bodyText) throws Exception {

    String emailContent =
            "To: " + to + "\r\n" +
            "Subject: " + subject + "\r\n" +
            "Content-Type: text/plain; charset=UTF-8\r\n" +
            "\r\n" +
            bodyText;

    byte[] emailBytes =
            emailContent.getBytes(java.nio.charset.StandardCharsets.UTF_8);

    String encodedEmail =
            java.util.Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(emailBytes);

    Message message = new Message();

    message.setRaw(encodedEmail);

    return message;
}
public String sendEmail(
        String to,
        String subject,
        String bodyText) throws Exception {

    Gmail gmail = getGmailClient();

    Message emailMessage =
            createEmailMessage(to, subject, bodyText);

    Message sentMessage = gmail.users()
            .messages()
            .send("me", emailMessage)
            .execute();

    return sentMessage.getId();
}
}