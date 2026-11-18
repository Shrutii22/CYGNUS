
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Clock3,
  RefreshCw,
  StickyNote
} from "lucide-react";

import ModuleHeader from "../components/ModuleHeader";
import { noteService } from "../services/api";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  // Load notes from backend
  const loadNotes = async () => {
    try {
      setError("");
      setLoading(true);

      const result = await noteService.list();
      setNotes(result);
    } catch (e) {
      setError(e.message || "Unable to load notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // Search notes by title or content
  const filteredNotes = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return notes;

    return notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(keyword) ||
        note.content?.toLowerCase().includes(keyword)
    );
  }, [notes, search]);

  // Reset editor
  const resetEditor = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
    setShowEditor(false);
  };

  // Open new note editor
  const createNew = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
    setError("");
    setShowEditor(true);
  };

  // Open existing note for editing
  const editNote = (note) => {
    setTitle(note.title || "");
    setContent(note.content || "");
    setEditingId(note.id);
    setError("");
    setShowEditor(true);
  };

  // Save or update note
  const saveNote = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a note title.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const noteData = {
        title: title.trim(),
        content: content.trim()
      };

      if (editingId !== null) {
        const updatedNote = await noteService.update(
          editingId,
          noteData
        );

        setNotes((current) =>
          current.map((note) =>
            note.id === editingId ? updatedNote : note
          )
        );
      } else {
        const newNote = await noteService.create(noteData);
        setNotes((current) => [newNote, ...current]);
      }

      resetEditor();
    } catch (e) {
      setError(e.message || "Unable to save note.");
    } finally {
      setSaving(false);
    }
  };

  // Delete note
  const deleteNote = async (note) => {
    const confirmed = window.confirm(
      `Delete "${note.title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      await noteService.remove(note.id);

      setNotes((current) =>
        current.filter((item) => item.id !== note.id)
      );

      if (editingId === note.id) {
        resetEditor();
      }
    } catch (e) {
      setError(e.message || "Unable to delete note.");
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "Recently";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Recently";

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <section className="module">
      <ModuleHeader
        eyebrow="YOUR THINKING SPACE"
        title="Notes"
        description="Capture ideas, keep useful information and return to it anytime."
        action={
          <button
            className="primary"
            onClick={createNew}
            type="button"
          >
            <Plus size={17} />
            New note
          </button>
        }
      />

      {/* Statistics */}
      <div className="stats">
        <div>
          <small>Total notes</small>
          <b>{notes.length}</b>
        </div>

        <div>
          <small>Showing</small>
          <b>{filteredNotes.length}</b>
        </div>

        <div>
          <small>Storage</small>
          <b>MySQL</b>
        </div>
      </div>

      {/* Search */}
      <div className="search">
        <Search size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes by title or content..."
          aria-label="Search notes"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="error notes-error">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Note editor */}
      {showEditor && (
        <div className="panel note-editor">
          <div className="panel-head">
            <b>
              {editingId !== null ? "Edit note" : "Create a new note"}
            </b>

            <button
              type="button"
              className="note-icon-button"
              onClick={resetEditor}
              aria-label="Close editor"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={saveNote}>
            <input
              className="note-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your note a title..."
              maxLength={150}
              required
            />

            <textarea
              className="note-content-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your thoughts..."
              rows={7}
            />

            <div className="note-editor-actions">
              <button
                type="button"
                className="secondary"
                onClick={resetEditor}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary"
                disabled={!title.trim() || saving}
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save note"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes heading */}
      <div className="notes-section-heading">
        <div>
          <b>Your notes</b>
          <small>
            {notes.length} saved {notes.length === 1 ? "note" : "notes"}
          </small>
        </div>

        <button
          type="button"
          className="note-icon-button"
          onClick={loadNotes}
          disabled={loading}
          title="Refresh notes"
        >
          <RefreshCw
            size={16}
            className={loading ? "notes-spinning" : ""}
          />
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="panel empty notes-empty">
          <RefreshCw size={25} className="notes-spinning" />
          <b>Loading your notes...</b>
        </div>
      ) : filteredNotes.length === 0 ? (
        /* Empty state */
        <div className="panel empty notes-empty">
          <StickyNote size={32} />

          <b>
            {search
              ? "No matching notes found"
              : "Your thinking space is empty"}
          </b>

          <span>
            {search
              ? "Try another search keyword."
              : "Create your first note and keep your ideas in one place."}
          </span>

          {!search && (
            <button
              type="button"
              className="primary"
              onClick={createNew}
            >
              <Plus size={16} />
              Create your first note
            </button>
          )}
        </div>
      ) : (
        /* Notes grid */
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <article className="panel note-card" key={note.id}>
              <div className="note-card-top">
                <div className="note-card-icon">
                  <FileText size={18} />
                </div>

                <div className="note-card-actions">
                  <button
                    type="button"
                    className="note-icon-button"
                    onClick={() => editNote(note)}
                    title="Edit note"
                    aria-label={`Edit ${note.title}`}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    className="note-icon-button note-delete"
                    onClick={() => deleteNote(note)}
                    title="Delete note"
                    aria-label={`Delete ${note.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3>{note.title}</h3>

              <p className="note-card-content">
                {note.content || "No content added yet."}
              </p>

              <div className="note-card-footer">
                <Clock3 size={13} />
                <span>
                  Updated {formatDate(note.updatedAt || note.createdAt)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
