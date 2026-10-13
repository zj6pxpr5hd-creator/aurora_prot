# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-10-09 - Async Form State and Inline Feedback in Inline Editors
**Learning:** In inline editing interfaces like `MemoryEditor`, lacking feedback during async save operations leads to duplicate form submissions and user confusion if saving fails silently.
**Action:** Always provide explicit disabled states, a loading spinner, and actionable inline error messages (`role="alert"`) during asynchronous form updates.

## 2026-10-10 - Focus Management for Inline Deletion Confirmation
**Learning:** When expanding inline deletion confirmations, focus remains on the trigger or disappears, making keyboard navigation clunky and error-prone for screen reader and keyboard users.
**Action:** Shift focus automatically (`autoFocus`) to the non-destructive action (e.g. Cancel button) upon opening inline confirmation dialogs, and restore focus to the original delete button (`useRef`) when canceled.
