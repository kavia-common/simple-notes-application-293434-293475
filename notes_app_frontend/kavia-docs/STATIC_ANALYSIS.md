# Static Analysis Summary

This document summarizes linting, tests, and recommended improvements.

## Lint
- `npm run lint` (ESLint) passes with no findings.
- Project contains both CRA eslintConfig in package.json and a flat ESLint config `eslint.config.mjs` used by the CLI.
  - Recommendation: Prefer flat config and remove the legacy `"eslintConfig": "react-app"` from package.json, or remove `eslint.config.mjs` and rely solely on CRA. Keeping both may cause drift.

## Tests
- `npm test -- --watchAll=false` passes (1 test).
- A deprecation warning is emitted from react-dom-test-utils via @testing-library/react. This is upstream and benign.

## Code smells / dead code
- Removed unused `src/logo.svg`.
- Removed unused `@keyframes App-logo-spin` from App.css.

## A11y improvements
- Added `role="listbox"` on the notes list and `role="option"` with `aria-selected` for items.

## UX improvements
- Persist theme preference to localStorage (`notes-app:theme`).
- Add dev-only console warnings when localStorage read/write fails to aid debugging.

## Next steps (optional)
- Align ESLint configuration (choose single source of truth).
- Consider adding tests for CRUD behaviors and theme persistence.
- Consider debouncing search input for very large note lists.
