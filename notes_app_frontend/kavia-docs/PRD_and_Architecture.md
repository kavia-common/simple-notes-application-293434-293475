# Product Requirements Document (PRD) & Architecture Guide: Simple Notes App

## Overview
The **Simple Notes App** is a lightweight, frontend-only React application designed to allow users to capture, organize, and manage personal notes directly in their browser. It emphasizes speed, privacy (via local storage), and a clean, modern user interface with accessibility support.

## Goals and Non-Goals

### Goals
- **Core Utility**: Provide a seamless experience for creating, reading, updating, and deleting (CRUD) text-based notes.
- **Privacy & Persistence**: Ensure data is stored locally on the user's device (`localStorage`) without requiring an internet connection or account signup.
- **Usability**: Offer a responsive, accessible interface with support for light and dark themes.
- **Searchability**: Allow users to quickly find notes by filtering through titles and content.

### Non-Goals
- **Backend Sync**: There is no server-side database or cloud synchronization in this version.
- **Rich Text Editing**: Notes are currently plain text; complex formatting (bold, italic, images) is out of scope for the MVP.
- **Multi-User Support**: The app is strictly single-user, tied to the specific browser instance.

## Personas & User Stories

### Target Persona
**"The Quick Jotter"**: A busy professional or student who needs a distraction-free space to write down thoughts, to-do lists, or meeting minutes without the friction of logging in or waiting for cloud syncs.

### User Stories
1. **Create Note**: *As a user, I want to create a new note so that I can quickly capture a thought.*
2. **Edit Note**: *As a user, I want to edit the title and content of my notes so that I can keep them up to date.*
3. **Delete Note**: *As a user, I want to delete notes I no longer need to keep my list organized.*
4. **Search Notes**: *As a user, I want to search for specific keywords so that I can find relevant notes instantly.*
5. **Theme Toggle**: *As a user, I want to switch between light and dark modes to reduce eye strain depending on my environment.*
6. **Persist Data**: *As a user, I want my notes to be there when I refresh the page or return later.*

## Functional Requirements

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F-01 | **Create Note** | Users can click a "New Note" button to generate a blank note. | P0 |
| F-02 | **List Notes** | Sidebar displays a list of all notes (or filtered notes) with title and snippet. | P0 |
| F-03 | **Edit Note** | Selecting a note loads it into the editor. Changes to title and content are saved on "Save" or implicitly managed. | P0 |
| F-04 | **Delete Note** | Users can delete a specific note via a delete icon in the sidebar. | P1 |
| F-05 | **Search** | A search bar in the header filters the note list by matching text in the title or content. | P1 |
| F-06 | **Dark Mode** | A toggle button switches the UI colors between Light and Dark themes. | P2 |
| F-07 | **Local Storage** | All notes are saved to `localStorage` under the key `notes-app:notes`. | P0 |

## Non-Functional Requirements
- **Performance**: App load time should be under 1 second; interactions (typing, switching notes) should be near-instant (<100ms).
- **Accessibility**: Interface must use semantic HTML and ARIA labels for screen reader compatibility. Focus management should support keyboard navigation.
- **Responsiveness**: Layout must adapt to different screen sizes. On mobile (<900px), the sidebar might need adjustment (currently responsive via CSS media queries).
- **Code Quality**: Modular React components, clear variable naming, and standard linting (ESLint).

## Success Metrics
- **User Retention**: Users returning to the app (implicitly measured by data persistence usage).
- **Task Completion Time**: Time taken to create and save a note.
- **Error Rate**: Zero data loss incidents (localStorage reliability).

## Assumptions & Constraints
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge) with `localStorage` enabled.
- **Storage Limit**: Limited by browser `localStorage` quotas (typically ~5MB), sufficient for thousands of text-only notes.
- **Data Persistence**: Data is lost if the user clears their browser cache/local storage.

---

## High-Level Architecture

The application is built as a Single Page Application (SPA) using **React**. It creates a virtual DOM to manage UI updates efficiently and relies on browser APIs for persistence.

### Component Breakdown

The UI is decomposed into functional components managed by a central `App` container.

```mermaid
graph TD
    App[App Container] --> Header[AppHeader]
    App --> Main[Main Layout]
    Main --> Sidebar[Sidebar (Aside)]
    Main --> Editor[Editor Section]
    Sidebar --> NotesList[NotesList Component]
    NotesList --> NoteItem[Note Item]
    Editor --> NoteEditor[NoteEditor Component]
```

- **App.js**: The root component. It holds the global state (`notes`, `theme`, `searchQuery`, `selectedNote`). It orchestrates data flow between the list and the editor.
- **AppHeader**: Contains the application brand, the global search input, and the "New Note" / "Theme Toggle" actions.
- **NotesList**: Renders the list of notes. It handles the display of the "Empty State" if no notes match the filter.
- **NoteEditor**: The main workspace. It consists of input fields for the Note Title and Note Content. It calls save handlers passed down from `App`.
- **useNotes (Hook)**: A custom React hook that encapsulates the CRUD logic and interaction with `localStorage`.

### State & Data Flow

1.  **Initialization**: On load, `useNotes` reads `localStorage` key `notes-app:notes`. If empty, it initializes an empty array.
2.  **Unidirectional Flow**: Data flows down from `App` to child components via props.
3.  **Events**: Child components (like `NoteEditor` or `NotesList`) emit events (callbacks) up to `App` to modify state (e.g., `onSave`, `onDelete`, `onSelect`).
4.  **Persistence**: A `useEffect` hook in `useNotes` listens for changes to the `notes` array and writes the updated JSON string back to `localStorage`.

### Storage Strategy
- **Mechanism**: `window.localStorage`
- **Key**: `notes-app:notes`
- **Schema**: Array of Note objects.
  ```json
  [
    {
      "id": "uuid-or-timestamp",
      "title": "Grocery List",
      "content": "Milk, Eggs, Bread",
      "updatedAt": 1678900000000
    }
  ]
  ```

### Error Handling & Accessibility
- **Error Handling**: The `useNotes` hook wraps `localStorage` calls in `try/catch` blocks to prevent crashes if storage is disabled or full.
- **Accessibility (a11y)**:
    - Semantic HTML tags (`<header>`, `<main>`, `<aside>`, `<section>`).
    - `aria-label` attributes on buttons and inputs without visible labels.
    - Focus outlines managed via CSS variables.

### Theming & Styling
- **CSS Variables**: Defined in `App.css`. The `[data-theme="dark"]` attribute on the `<html>` root element toggles variable values.
- **Palette**:
    - Primary: `#3b82f6` (Blue)
    - Success/Accent: `#06b6d4` (Cyan)
    - Background: `#f9fafb` (Light) / `#0f172a` (Dark)
    - Surface: `#ffffff` (Light) / `#111827` (Dark)

### Security & Privacy Considerations
- **XSS Prevention**: React automatically escapes content in JSX, preventing script injection via note content.
- **Data Privacy**: Data never leaves the user's browser. There is no transmission over the network.

---

## Operational Notes / Runbook

### Prerequisites
- Node.js (v14+) and npm.

### Installation & Startup
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm start
    ```
    Access the app at `http://localhost:3000`.

### Building for Production
1.  **Build Command**:
    ```bash
    npm run build
    ```
2.  **Output**: Static files are generated in the `build/` directory, ready to be hosted on any static site host (Netlify, Vercel, S3).

## Known Limitations
- **Concurrency**: Opening the app in multiple tabs may lead to race conditions where the last write wins, potentially overwriting changes made in another tab (no "storage" event listener implemented for sync).
- **Scalability**: Performance may degrade if thousands of notes are loaded into the DOM simultaneously (no virtualization implemented).

## Future Enhancements
- **Rich Text Support**: Integrate a Markdown or WYSIWYG editor.
- **Categories/Tags**: Add ability to tag notes for better organization.
- **Cloud Sync**: Optional integration with a backend (Supabase/Firebase) to sync notes across devices.
- **List Virtualization**: Implement `react-window` to support massive note lists efficiently.
