import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

// Types
/**
 * @typedef {{ id: string, title: string, content: string, updatedAt: number }} Note
 */

// Helpers
const LS_KEY = 'notes-app:notes';

function loadNotes() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(notes));
  } catch {
    // no-op if storage unavailable
  }
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Notes state
  const [notes, setNotes] = useState(() => loadNotes());
  const [selectedId, setSelectedId] = useState(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [contentDraft, setContentDraft] = useState('');

  // Search query state
  const [query, setQuery] = useState('');

  // Persist notes
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Create a new note
  const createNote = () => {
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const newNote = {
      id,
      title: 'Untitled',
      content: '',
      updatedAt: Date.now(),
    };
    const next = [newNote, ...notes];
    setNotes(next);
    setSelectedId(id);
    setTitleDraft(newNote.title);
    setContentDraft(newNote.content);
  };

  // Delete note
  const deleteNote = (id) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id || null);
      setTitleDraft(next[0]?.title || '');
      setContentDraft(next[0]?.content || '');
    }
  };

  // Select note
  const selectNote = (id) => {
    setSelectedId(id);
    const n = notes.find((x) => x.id === id);
    setTitleDraft(n?.title || '');
    setContentDraft(n?.content || '');
  };

  // Save edits
  const saveEdits = () => {
    if (!selectedId) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedId
          ? { ...n, title: titleDraft, content: contentDraft, updatedAt: Date.now() }
          : n
      )
    );
  };

  // Filtered notes memoized by query and notes
  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => {
      const t = (n.title || '').toLowerCase();
      const c = (n.content || '').toLowerCase();
      return t.includes(q) || c.includes(q);
    });
  }, [notes, query]);

  // Ensure selection persists when filter changes: if selected note not in filtered, keep it selected but list won't show it; user can clear query to find it.
  // If nothing selected, auto select first filtered
  useEffect(() => {
    if (!selectedId && filteredNotes.length > 0) {
      selectNote(filteredNotes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredNotes, selectedId]);

  const selected = notes.find((n) => n.id === selectedId) || null;

  return (
    <div className="App">
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
            onClick={createNote}
            aria-label="Create a new note"
          >
            + New Note
          </button>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar" aria-label="Notes list">
          {filteredNotes.length === 0 ? (
            <div className="empty">No notes match your search.</div>
          ) : (
            <ul className="notes-list">
              {filteredNotes.map((n) => (
                <li
                  key={n.id}
                  className={`note-item ${selectedId === n.id ? 'active' : ''}`}
                >
                  <button
                    className="note-button"
                    onClick={() => selectNote(n.id)}
                    aria-label={`Open note ${n.title || 'Untitled'}`}
                  >
                    <div className="note-title">{n.title || 'Untitled'}</div>
                    <div className="note-snippet">
                      {(n.content || '').slice(0, 80)}
                    </div>
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => deleteNote(n.id)}
                    aria-label={`Delete note ${n.title || 'Untitled'}`}
                    title="Delete note"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="editor" aria-label="Editor">
          {!selected ? (
            <div className="placeholder">
              <p>Select a note or create a new one to start editing</p>
            </div>
          ) : (
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
                <button className="btn" onClick={saveEdits} aria-label="Save note">
                  Save
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
