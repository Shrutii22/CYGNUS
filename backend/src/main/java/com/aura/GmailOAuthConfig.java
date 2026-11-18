
package com.aura;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import com.google.api.client.util.store.FileDataStoreFactory;
import java.io.File;

@Configuration
public class GmailOAuthConfig {

    @Value("${gmail.oauth.tokens-directory}")
private String tokensDirectory;

    @Value("${gmail.oauth.credentials-file}")
    private String credentialsFile;

    @Value("${gmail.oauth.scopes}")
    private String gmailScope;

    @Bean
    public GoogleAuthorizationCodeFlow gmailAuthorizationCodeFlow()
            throws Exception {

        NetHttpTransport httpTransport =
                GoogleNetHttpTransport.newTrustedTransport();

        GsonFactory jsonFactory = GsonFactory.getDefaultInstance();

        GoogleClientSecrets clientSecrets;

        try (FileInputStream inputStream =
                     new FileInputStream(credentialsFile);
             InputStreamReader reader =
                     new InputStreamReader(inputStream, StandardCharsets.UTF_8)) {

            clientSecrets = GoogleClientSecrets.load(
                    jsonFactory,
                    reader
            );
        }

        return new GoogleAuthorizationCodeFlow.Builder(
                httpTransport,
                jsonFactory,
                clientSecrets,
                List.of(gmailScope)
        )
                .setAccessType("offline")
                .setDataStoreFactory(
    new FileDataStoreFactory(new File(tokensDirectory))
)
                .build();
    }
}
