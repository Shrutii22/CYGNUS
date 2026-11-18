
package com.aura.agent;
import java.net.URI;

import java.io.IOException;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
@Component
public class ApplicationLauncher {

    public boolean openApplication(String applicationName) {

        if (applicationName == null) {
            return false;
        }

        String app = applicationName.toLowerCase();

        try {

            switch (app) {

                case "notepad":
                    new ProcessBuilder("notepad.exe").start();
                    break;

                case "calculator":
                    new ProcessBuilder("calc.exe").start();
                    break;

                case "paint":
                    new ProcessBuilder("mspaint.exe").start();
                    break;

                case "chrome":
                    new ProcessBuilder(
                        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
                    ).start();
                    break;

               case "vscode":
    new ProcessBuilder(
        "C:\\Users\\SHRUTI\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe"
    ).start();
    break;

                case "explorer":
                    new ProcessBuilder("explorer.exe").start();
                    break;

                case "cmd":
                    new ProcessBuilder(
                        "cmd.exe",
                        "/c",
                        "start",
                        "",
                        "cmd.exe"
                    ).start();
                    break;

                default:
                    System.out.println("Application not allowed: " + applicationName);
                    return false;
            }

            System.out.println(app + " launch requested!");
            return true;

        } catch (IOException e) {
            System.out.println("Could not launch " + app);
            e.printStackTrace();
            return false;
        }
    }


public boolean openWebsite(String url) {

    if (url == null || url.isBlank()) {
        return false;
    }

    try {
        URI website = URI.create(url.trim());

        String scheme = website.getScheme();

        if (scheme == null ||
                !(scheme.equalsIgnoreCase("http")
                || scheme.equalsIgnoreCase("https")) ||
                website.getHost() == null ||
                website.getUserInfo() != null) {

            System.out.println("Invalid website URL: " + url);
            return false;
        }

        String chromePath =
                "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

        new ProcessBuilder(
                chromePath,
                "--new-window",
                website.toASCIIString()
        ).start();

        System.out.println("Website launch requested: " + url);

        return true;

    } catch (IllegalArgumentException | IOException e) {

        System.out.println("Could not open website: " + url);
        e.printStackTrace();

        return false;
    }
}
public boolean createTextFile(String fileName, String content) {

    if (fileName == null || fileName.isBlank()) {
        return false;
    }

    // Allow only simple text filenames
   if (!fileName.matches("(?i)[a-z0-9][a-z0-9._ -]*\\.(txt|java|html|css|js)")) {
    System.out.println("Invalid file name: " + fileName);
    return false;
}

    try {

        // Create CYGNUS folder inside Documents
        Path folder = Path.of(
                System.getProperty("user.home"),
                "Documents",
                "CYGNUS"
        );

        Files.createDirectories(folder);

        // Create the requested file
        Path filePath = folder.resolve(fileName);

        Files.writeString(
                filePath,
                content == null ? "" : content,
                StandardCharsets.UTF_8,
                StandardOpenOption.CREATE_NEW,
StandardOpenOption.WRITE
        );

        // Open the newly created file in Notepad
        new ProcessBuilder(
                "notepad.exe",
                filePath.toString()
        ).start();

        System.out.println("File created: " + filePath);

        return true;

    } catch (IOException e) {

        System.out.println("Could not create file: " + fileName);
        e.printStackTrace();

        return false;
    }
}   

public boolean createProject(String projectName, Map<String, String> files) {

    if (projectName == null ||
            !projectName.matches("[a-zA-Z0-9][a-zA-Z0-9._ -]*") ||
            files == null ||
            files.isEmpty()) {

        System.out.println("Invalid project details.");
        return false;
    }

    // Validate every file before creating the project
    for (Map.Entry<String, String> entry : files.entrySet()) {

        String fileName = entry.getKey();

        if (fileName == null ||
                !fileName.matches("(?i)[a-z0-9][a-z0-9._ -]*\\.(txt|java|html|css|js)") ||
                entry.getValue() == null) {

            System.out.println("Invalid project file: " + fileName);
            return false;
        }
    }

    Path rootFolder = Path.of(
            System.getProperty("user.home"),
            "Documents",
            "CYGNUS"
    );

    Path projectFolder = rootFolder.resolve(projectName);

    List<Path> createdFiles = new ArrayList<>();
    boolean projectFolderCreated = false;

    try {

        Files.createDirectories(rootFolder);

        // Never overwrite an existing project folder
        Files.createDirectory(projectFolder);
        projectFolderCreated = true;

        // Create all requested files
        for (Map.Entry<String, String> entry : files.entrySet()) {

            Path filePath = projectFolder.resolve(entry.getKey());

            Files.writeString(
                    filePath,
                    entry.getValue(),
                    StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE_NEW,
                    StandardOpenOption.WRITE
            );

            createdFiles.add(filePath);
        }

        System.out.println("Project created: " + projectFolder);

    } catch (IOException e) {

        System.out.println("Project creation failed.");
        e.printStackTrace();

        // Clean up files created during this failed attempt
        for (Path file : createdFiles) {
            try {
                Files.deleteIfExists(file);
            } catch (IOException cleanupError) {
                cleanupError.printStackTrace();
            }
        }

        if (projectFolderCreated) {
    try {
        Files.deleteIfExists(projectFolder);
    } catch (IOException cleanupError) {
        cleanupError.printStackTrace();
    }
}

        return false;
    }

    // Open the completed project in VS Code
    try {

        new ProcessBuilder(
                "C:\\Users\\SHRUTI\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe",
                projectFolder.toString()
        ).start();

    } catch (IOException e) {

        System.out.println("Project created, but VS Code could not be opened.");
        e.printStackTrace();
    }

    return true;
}

}
