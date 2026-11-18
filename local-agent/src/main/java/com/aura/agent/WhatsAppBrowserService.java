
package com.aura.agent;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.WaitForSelectorState;
import com.microsoft.playwright.options.WaitUntilState;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WhatsAppBrowserService {

    private static final String CHROME_PATH =
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

    private static final String CDP_URL =
            "http://127.0.0.1:9223";

    private Playwright playwright;
    private Browser browser;
    private BrowserContext context;
    private Page page;

    // Tracks WhatsApp requests already processed by this agent.
private final Set<String> processedWhatsAppRequests =
        ConcurrentHashMap.newKeySet();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(2))
            .build();

    // --------------------------------------------------
    // 1. OPEN WHATSAPP WEB
    // --------------------------------------------------

    public synchronized String openWhatsAppWeb() {

        try {

            String localAppData = System.getenv("LOCALAPPDATA");

            if (localAppData == null || localAppData.isBlank()) {
                return "Windows application data directory not found.";
            }

            Path profilePath = Paths.get(
                    localAppData,
                    "CYGNUS",
                    "WhatsAppChromeProfile"
            ).toAbsolutePath();

            Path chromePath = Paths.get(CHROME_PATH);

            if (!Files.exists(chromePath)) {
                return "Google Chrome was not found at: " + CHROME_PATH;
            }

            Files.createDirectories(profilePath);

            // Start Chrome if it is not already running.
            if (!isChromeDebuggingReady()) {

                ProcessBuilder processBuilder = new ProcessBuilder(
                        CHROME_PATH,
                        "--remote-debugging-port=9223",
                        "--remote-debugging-address=127.0.0.1",
                        "--user-data-dir=" + profilePath,
                        "--no-first-run",
                        "--no-default-browser-check",
                        "https://web.whatsapp.com/"
                );

                processBuilder.redirectErrorStream(true);
                processBuilder.redirectOutput(
                        ProcessBuilder.Redirect.DISCARD
                );

                processBuilder.start();

                boolean ready = false;

                for (int i = 0; i < 40; i++) {

                    if (isChromeDebuggingReady()) {
                        ready = true;
                        break;
                    }

                    Thread.sleep(500);
                }

                if (!ready) {
                    return "Chrome debugging endpoint did not become available.";
                }
            }

            // Initialize Playwright.
            if (playwright == null) {

                System.out.println(
                        "CYGNUS: Before Playwright.create()"
                );

                playwright = Playwright.create();

                System.out.println(
                        "CYGNUS: After Playwright.create()"
                );
            }

            // Connect to the existing Chrome session.
            if (browser == null) {

                System.out.println(
                        "CYGNUS: Before connectOverCDP()"
                );

                browser = playwright.chromium()
                        .connectOverCDP(CDP_URL);

                System.out.println(
                        "CYGNUS: After connectOverCDP()"
                );
            }

            List<BrowserContext> contexts = browser.contexts();

            if (contexts.isEmpty()) {
                return "Could not access the Chrome browser context.";
            }

            context = contexts.get(0);

            if (page == null || page.isClosed()) {

                List<Page> pages = context.pages();

                page = pages.isEmpty()
                        ? context.newPage()
                        : pages.get(0);
            }

            if (!page.url().contains("web.whatsapp.com")) {

                page.navigate(
                        "https://web.whatsapp.com/",
                        new Page.NavigateOptions()
                                .setWaitUntil(
                                        WaitUntilState.DOMCONTENTLOADED
                                )
                                .setTimeout(30000)
                );
            }

            return "WhatsApp Web opened successfully.";

        } catch (Exception e) {

            return "Could not open WhatsApp Web: " + e.getMessage();
        }
    }

    // --------------------------------------------------
    // 2. CHECK CHROME DEBUGGING CONNECTION
    // --------------------------------------------------

    private boolean isChromeDebuggingReady() {

        try {

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(CDP_URL + "/json/version"))
                    .timeout(Duration.ofSeconds(2))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            return response.statusCode() == 200;

        } catch (Exception e) {

            return false;
        }
    }

    // --------------------------------------------------
    // 3. PREPARE WHATSAPP MESSAGE
    // --------------------------------------------------

    public synchronized String prepareWhatsAppMessage(
            String phoneNumber,
            String messageText) {

        try {

            if (phoneNumber == null || phoneNumber.isBlank()) {
                return "Phone number is required.";
            }

            if (messageText == null || messageText.isBlank()) {
                return "Message cannot be empty.";
            }

            if (messageText.length() > 4000) {
                return "Message is too long.";
            }

            // Clean the phone number.
            String cleanPhone = phoneNumber.replaceAll(
                    "[\\s+()-]",
                    ""
            );

            if (!cleanPhone.matches("\\d{8,15}")) {
                return "Invalid phone number format.";
            }

            // Ensure WhatsApp Web is connected.
            String openResult = openWhatsAppWeb();

            if (!openResult.contains("successfully")) {
                return openResult;
            }

            // Encode the message for the URL.
            String encodedMessage = URLEncoder.encode(
                    messageText,
                    StandardCharsets.UTF_8
            );

            String chatUrl =
                    "https://web.whatsapp.com/send?phone="
                            + cleanPhone
                            + "&text="
                            + encodedMessage;

            System.out.println(
                    "CYGNUS: Opening WhatsApp chat for saved contact."
            );

            page.navigate(
                    chatUrl,
                    new Page.NavigateOptions()
                            .setWaitUntil(
                                    WaitUntilState.DOMCONTENTLOADED
                            )
                            .setTimeout(30000)
            );

            // Locate the message input.
            Locator messageBox = page.locator(
                    "footer [contenteditable='true'][role='textbox']"
            );

            messageBox.waitFor(
                    new Locator.WaitForOptions()
                            .setState(WaitForSelectorState.VISIBLE)
                            .setTimeout(30000)
            );

            return "WhatsApp message prepared successfully.";

        } catch (Exception e) {

            return "Could not prepare WhatsApp message: "
                    + e.getMessage();
        }
    }

    // --------------------------------------------------
    // 4. SEND WHATSAPP MESSAGE
    // --------------------------------------------------

private boolean verifyRecipientName(String recipientName) {

    try {

        Locator chatTitle = page.locator(
                "header [data-testid='conversation-info-header-chat-title']"
        );

        chatTitle.waitFor(
                new Locator.WaitForOptions()
                        .setState(WaitForSelectorState.VISIBLE)
                        .setTimeout(10000)
        );

        if (chatTitle.count() != 1) {
            System.out.println(
                    "CYGNUS: Could not uniquely identify WhatsApp chat header."
            );
            return false;
        }

        String actualName = chatTitle.innerText().trim();

        String expectedName = recipientName.trim();

        System.out.println(
                "CYGNUS: Expected recipient = " + expectedName
        );

        System.out.println(
                "CYGNUS: WhatsApp chat header = " + actualName
        );

        return actualName.equalsIgnoreCase(expectedName);

    } catch (Exception e) {

        System.out.println(
                "CYGNUS: Recipient verification failed: " + e.getMessage()
        );

        return false;
    }
}

  public synchronized String sendWhatsAppMessage(
        String requestId,
        String recipientName,
        String phoneNumber,
        String messageText) {

        try {
       

            // Validate the input before opening WhatsApp.
            if (requestId == null || requestId.isBlank()) {
    return "Request ID is required.";
}

if (processedWhatsAppRequests.contains(requestId)) {
    return "Duplicate request blocked. This request has already been processed.";
}
            if (phoneNumber == null || phoneNumber.isBlank()) {
                return "Phone number is required.";
            }

            if (messageText == null || messageText.isBlank()) {
                return "Message cannot be empty.";
            }

            if (messageText.length() > 4000) {
                return "Message is too long.";
            }

            if (recipientName == null || recipientName.isBlank()) {
    return "Recipient name is required.";
}
            // Prepare the message first.
            String prepareResult = prepareWhatsAppMessage(
                    phoneNumber,
                    messageText
            );

            if (!prepareResult.startsWith(
                    "WhatsApp message prepared successfully")) {

                return prepareResult;
            }
        // Verify that the opened WhatsApp chat belongs to the expected contact.
if (!verifyRecipientName(recipientName)) {

    return "Sending cancelled: WhatsApp recipient could not be verified. "
            + "Expected contact: " + recipientName;
}
            // Locate the message input.
            Locator messageBox = page.locator(
                    "footer [contenteditable='true'][role='textbox']"
            );

            // Verify the exact message.
            String preparedText = messageBox.innerText().trim();

            if (!preparedText.equals(messageText.trim())) {

                return "Sending cancelled: message verification failed.";
            }

            // Check available Send button selectors.
            Locator sendButton = page.locator(
                    "footer [data-testid='send']"
            );

            System.out.println(
                    "CYGNUS: data-testid send count = "
                            + sendButton.count()
            );

            if (sendButton.count() == 0) {

                sendButton = page.locator(
                        "footer button[aria-label='Send']"
                );

                System.out.println(
                        "CYGNUS: aria-label Send count = "
                                + sendButton.count()
                );
            }

            if (sendButton.count() == 0) {

                sendButton = page.locator(
                        "footer [data-icon='send']"
                );

                System.out.println(
                        "CYGNUS: send icon count = "
                                + sendButton.count()
                );
            }

            if (sendButton.count() == 0) {

                return "Could not locate WhatsApp's Send button.";
            }

            // Ensure the Send button is visible and enabled.
            sendButton.waitFor(
                    new Locator.WaitForOptions()
                            .setState(WaitForSelectorState.VISIBLE)
                            .setTimeout(10000)
            );

            if (!sendButton.isEnabled()) {
                return "WhatsApp Send button is currently disabled.";
            }
            
            // Click Send only once.
            System.out.println(
                    "CYGNUS: Clicking WhatsApp Send button."
            );
             // Reserve this request before attempting to send.
if (!processedWhatsAppRequests.add(requestId)) {
    return "Duplicate request blocked. This request has already been processed.";
}
            sendButton.click();

            // Allow WhatsApp to process the message.
            messageBox.waitFor(
                    new Locator.WaitForOptions()
                            .setState(WaitForSelectorState.VISIBLE)
                            .setTimeout(10000)
            );

            String remainingText = messageBox.innerText().trim();

            if (!remainingText.isEmpty()) {

                return "Send was clicked, but the message box still "
                        + "contains text. Please check WhatsApp manually.";
            }

            return "WhatsApp Send button clicked successfully. "
                    + "Delivery status is not yet verified.";

        } catch (Exception e) {

            return "Could not send WhatsApp message: "
                    + e.getMessage();
        }
    }
    public synchronized String testRecipientVerification(
        String recipientName,
        String phoneNumber) {

    try {

        String result = prepareWhatsAppMessage(
                phoneNumber,
                "CYGNUS recipient verification test"
        );

        if (!result.startsWith(
                "WhatsApp message prepared successfully")) {
            return result;
        }

        boolean verified = verifyRecipientName(recipientName);

        if (verified) {
            return "SUCCESS: WhatsApp recipient verified.";
        }

        return "FAILED: WhatsApp recipient does not match.";

    } catch (Exception e) {
        return "Verification test failed: " + e.getMessage();
    }
}
}
