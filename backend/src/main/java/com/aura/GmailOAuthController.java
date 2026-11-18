
package com.aura;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.UUID;

@RestController
public class GmailOAuthController {

    private final GoogleAuthorizationCodeFlow authorizationCodeFlow;

    @Value("${gmail.oauth.redirect-uri}")
    private String redirectUri;

    public GmailOAuthController(
            GoogleAuthorizationCodeFlow authorizationCodeFlow) {

        this.authorizationCodeFlow = authorizationCodeFlow;
    }

    // Start Google OAuth authorization
    @GetMapping("/api/gmail/connect")
    public ResponseEntity<Void> connectGmail(HttpSession session) {

        String state = UUID.randomUUID().toString();

        session.setAttribute("gmailOAuthState", state);

        String authorizationUrl = authorizationCodeFlow
                .newAuthorizationUrl()
                .setRedirectUri(redirectUri)
                .setState(state)
                .set("prompt", "consent")
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(authorizationUrl));

        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    // Handle Google's OAuth callback
    @GetMapping("/api/gmail/oauth2/callback")
    public ResponseEntity<String> gmailCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "error", required = false) String error,
            HttpSession session) {

        if (error != null) {
            return ResponseEntity.badRequest()
                    .body("Gmail authorization was denied.");
        }

        String savedState =
                (String) session.getAttribute("gmailOAuthState");

        session.removeAttribute("gmailOAuthState");

        if (savedState == null || !savedState.equals(state)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Invalid OAuth state.");
        }

        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Authorization code is missing.");
        }

        try {
            GoogleTokenResponse tokenResponse =
                    authorizationCodeFlow
                            .newTokenRequest(code)
                            .setRedirectUri(redirectUri)
                            .execute();

            authorizationCodeFlow.createAndStoreCredential(
                    tokenResponse,
                    "user"
            );

            return ResponseEntity.ok(
                    "Gmail connected successfully to CYGNUS!"
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(
                    HttpStatus.INTERNAL_SERVER_ERROR
            ).body("Could not complete Gmail authorization.");
        }
    }
}
