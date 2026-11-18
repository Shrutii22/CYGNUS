
package com.aura;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    // Upload a PDF
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file) {

        try {
            Document document = documentService.uploadDocument(file);

            return ResponseEntity.status(HttpStatus.CREATED).body(document);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", exception.getMessage())
            );

        } catch (IOException exception) {

            return ResponseEntity.internalServerError().body(
                    java.util.Map.of("error", "Unable to save the PDF.")
            );
        }
    }

    // Get all uploaded PDFs
    @GetMapping
    public List<Document> getAllDocuments() {
        return documentService.getAllDocuments();
    }
    @GetMapping("/{id}/text")
public ResponseEntity<?> getExtractedText(@PathVariable Long id) {

    try {
        String extractedText = documentService.getExtractedText(id);

        return ResponseEntity.ok(
                java.util.Map.of("text", extractedText == null ? "" : extractedText)
        );

    } catch (IllegalArgumentException exception) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                java.util.Map.of("error", exception.getMessage())
        );
    }
}

@PostMapping("/{id}/extract")
public ResponseEntity<?> reprocessDocument(@PathVariable Long id) {
    try {
        Document document = documentService.reprocessDocument(id);

        return ResponseEntity.ok(
                java.util.Map.of(
                        "id", document.getId(),
                        "fileName", document.getOriginalFileName(),
                        "extractedTextLength",
                        document.getExtractedText() == null
                                ? 0
                                : document.getExtractedText().length(),
                        "message", "PDF text extraction completed."
                )
        );

    } catch (IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                java.util.Map.of("error", exception.getMessage())
        );
    } catch (IOException exception) {
        return ResponseEntity.internalServerError().body(
                java.util.Map.of("error", "Unable to extract PDF text.")
        );
    }
}

}

