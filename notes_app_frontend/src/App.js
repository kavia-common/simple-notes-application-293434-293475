import React, { useEffect, useState } from 'react';
import './App.css';

/**
 * Note shape
 * @typedef {{ id: string, title: string, content: string, updatedAt: number }} Note
 */

const LS_KEY = 'notes-app:notes';

/**
 * Custom hook for notes CRUD in localStorage
 */
// PUBLIC_INTERFACE
function useNotes() {
  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(notes));
    } catch {}
  }, [notes]);

  // PUBLIC_INTERFACE
  const createNote = (title = 'Untitled', content = '') => {
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const newNote = { id, title, content, updatedAt: Date.now() };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  };

  // PUBLIC_INTERFACE
  const updateNote = (id, updates) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, ...updates, updatedAt: Date.now() }
          : n
      )
    );
  };

  // PUBLIC_INTERFACE
  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notes,
    setNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}

/**
 * Header includes app branding, search, actions
 */
function AppHeader({ query, setQuery, onNewNote, theme, onToggleTheme }) {
  return (
    <header className="app-navbar" role="banner">
      <div className="brand">
        <span className="brand-dot" aria-hidden="true" />
        <span className="brand-title">Simple Notes</span>
      </div>
      <div className="search-wrap">
        <label htmlFor="notes-search" className="sr-only">
          Search notes
        </label>
        <input
          id="notes-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes..."
          aria-label="Search notes"
          className="search-input"
        />
      </div>
      <div className="navbar-actions">
        <button
          className="btn primary"
          onClick={onNewNote}
          aria-label="Create a new note"
        >
          + New Note
        </button>
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
    </header>
  );
}

/**
 * Sidebar: lists notes, handles selection, delete
 */
function NotesList({ notes, selectedId, onSelect, onDelete }) {
  if (!notes.length) {
    return (
      <div className="empty">
        Welcome! Click {'"New Note"'} to create your first note.
      </div>
    );
  }
  return (
    <ul className="notes-list">
      {notes.map((n) => (
        <li
          key={n.id}
          className={`note-item ${selectedId === n.id ? 'active' : ''}`}
        >
          <button
            className="note-button"
            onClick={() => onSelect(n.id)}
            aria-label={`Open note ${n.title || 'Untitled'}`}
          >
            <div className="note-title">{n.title || 'Untitled'}</div>
            <div className="note-snippet">
              {(n.content || '').slice(0, 80)}
            </div>
          </button>
          <button
            className="icon-button danger"
            onClick={() => onDelete(n.id)}
            aria-label={`Delete note ${n.title || 'Untitled'}`}
            title="Delete note"
          >
            🗑️
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Main editor: view/edit selected note
 */
function NoteEditor({
  selected,
  titleDraft,
  setTitleDraft,
  contentDraft,
  setContentDraft,
  onSave,
}) {
  if (!selected) {
    return (
      <div className="placeholder" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
        <p>
          Select a note or create a new one to start editing.
        </p>
        <p style={{ fontSize: '16px', opacity: 0.7 }}>Your notes are stored privately in your browser.</p>
      </div>
    );
  }
  return (
    <div className="editor-inner">
      <input
        className="title-input"
        value={titleDraft}
        onChange={(e) => setTitleDraft(e.target.value)}
        placeholder="Note title"
        aria-label="Note title"
      />
      <textarea
        className="content-input"
        value={contentDraft}
        onChange={(e) => setContentDraft(e.target.value)}
        placeholder="Write your note here..."
        aria-label="Note content"
      />
      <div className="editor-actions">
        <button className="btn" onClick={onSave} aria-label="Save note">
          Save
        </button>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Notes logic
  const notesAPI = useNotes();
  const { notes, createNote, updateNote, deleteNote } = notesAPI;

  // List/selection state
  const [selectedId, setSelectedId] = useState(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [contentDraft, setContentDraft] = useState('');

  // Search state
  const [query, setQuery] = useState('');

  // Filter notes: search across titles/content
  const filteredNotes = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => {
      const t = (n.title || '').toLowerCase();
      const c = (n.content || '').toLowerCase();
      return t.includes(q) || c.includes(q);
    });
  }, [notes, query]);

  // Selection persistence
  useEffect(() => {
    // Select first filtered note if none selected
    if (!selectedId && filteredNotes.length > 0) {
      setSelectedId(filteredNotes[0].id);
      setTitleDraft(filteredNotes[0].title);
      setContentDraft(filteredNotes[0].content);
    }
    // If current selection is not in filtered, show but don't highlight in sidebar
  }, [filteredNotes, selectedId]);

  // If user clicks on a note, set selection/draft
  const handleSelectNote = (id) => {
    setSelectedId(id);
    const n = notes.find((x) => x.id === id);
    setTitleDraft(n?.title || '');
    setContentDraft(n?.content || '');
  };

  // Create a new note
  const handleNewNote = () => {
    const n = createNote();
    setSelectedId(n.id);
    setTitleDraft(n.title);
    setContentDraft(n.content);
  };

  // Delete a note
  const handleDeleteNote = (id) => {
    deleteNote(id);
    if (selectedId === id) {
      setSelectedId(filteredNotes[0]?.id || null);
      setTitleDraft(filteredNotes[0]?.title || '');
      setContentDraft(filteredNotes[0]?.content || '');
    }
  };

  // Save edits to selected note
  const handleSaveEdits = () => {
    if (!selectedId) return;
    updateNote(selectedId, { title: titleDraft, content: contentDraft });
  };

  const handleToggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  // The selected note (might not be in filtered if search hides it)
  const selected = notes.find((n) => n.id === selectedId) || null;

  // Empty state if no notes yet
  return (
    <div className="App" role="main">
      <AppHeader
        query={query}
        setQuery={setQuery}
        onNewNote={handleNewNote}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
      <main className="layout">
        <aside className="sidebar" aria-label="Notes list">
          {filteredNotes.length === 0 && notes.length > 0 ? (
            <div className="empty">No notes match your search.</div>
          ) : (
            <NotesList
              notes={filteredNotes}
              selectedId={selectedId}
              onSelect={handleSelectNote}
              onDelete={handleDeleteNote}
            />
          )}
        </aside>
        <section className="editor" aria-label="Editor">
          <NoteEditor
            selected={selected}
            titleDraft={titleDraft}
            setTitleDraft={setTitleDraft}
            contentDraft={contentDraft}
            setContentDraft={setContentDraft}
            onSave={handleSaveEdits}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
