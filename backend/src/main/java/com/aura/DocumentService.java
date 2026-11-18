
package com.aura;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final PdfTextExtractor pdfTextExtractor;
    private final Path storageDirectory;

    public DocumentService(
            DocumentRepository documentRepository,
            PdfTextExtractor pdfTextExtractor,
            @Value("${cygnus.file.storage-location}") String storageLocation) {

        this.documentRepository = documentRepository;
        this.pdfTextExtractor = pdfTextExtractor;

        this.storageDirectory = Paths.get(storageLocation)
                .toAbsolutePath()
                .normalize();
    }

    public Document uploadDocument(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select a PDF file.");
        }

        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null ||
                !originalFileName.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed.");
        }

        try (InputStream inputStream = file.getInputStream()) {
            byte[] header = inputStream.readNBytes(5);

            if (header.length != 5 ||
                    !new String(header, java.nio.charset.StandardCharsets.US_ASCII)
                            .equals("%PDF-")) {
                throw new IllegalArgumentException("The uploaded file is not a valid PDF.");
            }
        }

        Files.createDirectories(storageDirectory);

        String storedFileName = UUID.randomUUID() + ".pdf";

        Path destination = storageDirectory.resolve(storedFileName).normalize();

        if (!destination.startsWith(storageDirectory)) {
            throw new IllegalArgumentException("Invalid file path.");
        }

        try {
            // 1. Save the uploaded PDF to local storage
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destination);
            }

            // 2. Extract text from the saved PDF
            String extractedText = pdfTextExtractor.extractText(destination);
            System.out.println("========== PDF EXTRACTION TEST ==========");
System.out.println("Extracted text length: " + extractedText.length());
System.out.println("Extracted text preview: " +
        extractedText.substring(0, Math.min(200, extractedText.length())));
System.out.println("==========================================");

            // 3. Create document metadata
            Document document = new Document();

            document.setOriginalFileName(
                    Paths.get(originalFileName.replace("\\", "/"))
                            .getFileName().toString()
            );

            document.setStoredFileName(storedFileName);
            document.setFilePath(destination.toString());
            document.setFileSize(file.getSize());
            document.setContentType("application/pdf");

            // 4. Store extracted text in the document
            document.setExtractedText(extractedText);

            // 5. Save document metadata and extracted text in MySQL
            return documentRepository.save(document);

        } catch (IOException | RuntimeException exception) {

            // Remove the saved PDF if extraction or database saving fails
            Files.deleteIfExists(destination);

            throw exception;
        }
    }

public Document reprocessDocument(Long id) throws IOException {

    Document document = documentRepository.findById(id)
            .orElseThrow(() ->
                    new IllegalArgumentException("Document not found.")
            );

    Path pdfPath = Paths.get(document.getFilePath());

    if (!Files.exists(pdfPath)) {
        throw new IllegalArgumentException("PDF file not found in storage.");
    }

    String extractedText = pdfTextExtractor.extractText(pdfPath);

    document.setExtractedText(extractedText);

    return documentRepository.save(document);
}

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }
    public String getExtractedText(Long id) {

    Document document = documentRepository.findById(id)
            .orElseThrow(() ->
                    new IllegalArgumentException("Document not found.")
            );

    return document.getExtractedText();
}
}
