
import { useEffect, useRef, useState } from "react";
import {
  File,
  FolderOpen,
  UploadCloud,
  LoaderCircle,
  CheckCircle2,
  Eye,
  X,
  BookOpen
} from "lucide-react";

import ModuleHeader from "../components/ModuleHeader";
import { documentService } from "../services/api";

export default function Files() {
  const inputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [viewingDocument, setViewingDocument] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loadingText, setLoadingText] = useState(false);
  const [previewError, setPreviewError] = useState("");

  // Load uploaded documents
  const loadDocuments = async () => {
    try {
      setError("");

      const result = await documentService.list();
      setDocuments(result);

    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to load your documents."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Validate selected PDF
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setSuccess("");
    setSelectedFile(null);

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("File size must not exceed 20 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // Upload PDF
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      await documentService.upload(selectedFile);

      setSelectedFile(null);
      setSuccess("PDF uploaded successfully!");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      await loadDocuments();

    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to upload the PDF. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // Fetch extracted text for a document
  const handleViewText = async (doc) => {
    try {
      setViewingDocument(doc);
      setExtractedText("");
      setPreviewError("");
      setLoadingText(true);

      const text = await documentService.getText(doc.id);

      setExtractedText(text);

    } catch (err) {
      setPreviewError(
        err.response?.data?.error ||
        "Unable to load extracted document text."
      );
    } finally {
      setLoadingText(false);
    }
  };

  // Close document preview
  const closePreview = () => {
    setViewingDocument(null);
    setExtractedText("");
    setPreviewError("");
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <section className="module">
      <ModuleHeader
        eyebrow="YOUR KNOWLEDGE SPACE"
        title="Files"
        description="Keep documents and resources organized in one place."
      />

      {/* PDF Upload Section */}
      <div className="upload">
        <UploadCloud size={32} />

        <h3>Bring your files into CYGNUS</h3>

        <p>
          Upload your PDF documents and let CYGNUS help you
          understand and learn from them.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          hidden
        />

        <button
          className="secondary"
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <File size={16} />
          Choose PDF
        </button>

        {selectedFile && (
          <div className="selected-file">
            <File size={18} />

            <span>
              {selectedFile.name} ({formatSize(selectedFile.size)})
            </span>

            <button
              className="secondary"
              type="button"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <LoaderCircle size={16} />
                  Uploading...
                </>
              ) : (
                "Upload PDF"
              )}
            </button>
          </div>
        )}

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="success-message" role="status">
            <CheckCircle2 size={16} />
            {success}
          </p>
        )}

        <span className="upload-hint">
          PDF only · Maximum file size: 20 MB
        </span>
      </div>

      {/* Extracted Text Preview */}
      {viewingDocument && (
        <div className="panel document-preview">
          <div className="files-heading">
            <BookOpen size={20} />

            <h3>{viewingDocument.originalFileName}</h3>

            <button
              className="secondary"
              type="button"
              onClick={closePreview}
            >
              <X size={16} />
              Close
            </button>
          </div>

          {loadingText ? (
            <div className="empty">
              <LoaderCircle className="spin" size={24} />
              <span>Reading extracted text...</span>
            </div>
          ) : previewError ? (
            <p className="error-message" role="alert">
              {previewError}
            </p>
          ) : extractedText.trim() ? (
            <>
              <div className="preview-meta">
                <CheckCircle2 size={16} />
                {extractedText.length.toLocaleString()} characters extracted
              </div>

              <pre className="extracted-text">
                {extractedText}
              </pre>
            </>
          ) : (
            <div className="empty">
              <File size={28} />
              <b>No extracted text found</b>
              <span>
                This PDF may be scanned or may not contain readable text.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Documents */}
      <div className="panel">
        <div className="files-heading">
          <FolderOpen size={20} />
          <h3>Your Documents</h3>
          <span>{documents.length}</span>
        </div>

        {loading ? (
          <div className="empty">
            <LoaderCircle className="spin" size={24} />
            <span>Loading your documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty">
            <FolderOpen size={28} />
            <b>No files yet</b>
            <span>Your uploaded PDFs will appear here.</span>
          </div>
        ) : (
          <div className="document-list">
            {documents.map((doc) => (
              <div className="document-item" key={doc.id}>
                <File size={24} />

                <div className="document-info">
                  <b>{doc.originalFileName}</b>

                  <span>
                    {formatSize(doc.fileSize)} ·{" "}
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                </div>

                <span className="document-type">PDF</span>

                <button
                  className="secondary"
                  type="button"
                  onClick={() => handleViewText(doc)}
                  disabled={loadingText}
                >
                  <Eye size={16} />
                  View content
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
