# Simple Notes App (React)

A modern, lightweight React notes app featuring robust CRUD using localStorage, search, onboarding, accessibility, and modular design.

## Features

- **Full CRUD** for notes (create, read, update, delete), everything stored privately in browser localStorage.
- **Modular architecture**: notes CRUD handled via custom hook; main components: Header, NotesList, Editor.
- **Search**: real-time, searches titles and content.
- **Responsive UI**: clean, modern, and accessible with light/dark themes.
- **Onboarding**: Empty-state message prompts users to create notes.
- **Accessibility**: Semantic markup, ARIA labels, keyboard focus in forms.
- **No backend required**.

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `src/App.js`: Main entry, manages state, search, theming, and layout.
- `src/App.css`: Clean CSS (tokens, layout, sidebar/editor UI, theme switch).
- Modular in-file components for maximum readability.

## Customization

- **Colors**: See CSS variables in `App.css` for themes (primary: #3b82f6, background: #f9fafb, dark mode).
- **Components**: The UI can be extended by breaking out components into their own files, or by customizing styles in `App.css`.

## Accessibility/Design

- Uses semantic elements, ARIA labels, focus management.
- Responsive grid and flex layouts.
- Keyboard accessible note sidebar, editor forms.

## Search & Onboarding

- Search input filters notes across both title and content.
- Provides onboarding hint when no notes exist.

## Learn More

- [React documentation](https://reactjs.org/)
- App does not use a backend or external database.

## Advanced

- Notes are stored under `notes-app:notes` key in localStorage.
- All CRUD operations are handled optically and efficiently.

## License

MIT License. Template style by KAVIA.
