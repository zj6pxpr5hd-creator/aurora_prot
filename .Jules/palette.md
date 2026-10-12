# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-10-09 - Async Form State and Inline Feedback in Inline Editors
**Learning:** In inline editing interfaces like `MemoryEditor`, lacking feedback during async save operations leads to duplicate form submissions and user confusion if saving fails silently.
**Action:** Always provide explicit disabled states, a loading spinner, and actionable inline error messages (`role="alert"`) during asynchronous form updates.

## 2026-10-10 - Focus Management in Inline Delete Confirmations
**Learning:** In inline confirmation dialogs for destructive actions, failing to shift focus into the dialog prevents keyboard users from dismissing with Escape (since focus remains on non-focusable outer elements) and risks accidental repeated keypresses on the trigger button.
**Action:** Shift default focus to the non-destructive `Cancel` button using `autoFocus`, set `role="alertdialog"`, and return focus to the trigger button (`useRef`) when cancelled.
