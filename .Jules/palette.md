# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-10-09 - Async Form State and Inline Feedback in Inline Editors
**Learning:** In inline editing interfaces like `MemoryEditor`, lacking feedback during async save operations leads to duplicate form submissions and user confusion if saving fails silently.
**Action:** Always provide explicit disabled states, a loading spinner, and actionable inline error messages (`role="alert"`) during asynchronous form updates.

## 2026-10-11 - Focus Transfer and Keydown Event Delegation in Inline Dialogs
**Learning:** When inline confirmation containers render dynamically without focusing an internal element, focus remains on the trigger element outside the container. As a result, `onKeyDown` listeners (such as `Escape` handlers) attached to the confirmation container will fail to capture keypresses, and screen readers will fail to announce the prompt.
**Action:** Always place `autoFocus` on the safe default action (e.g. `Cancel`) inside inline confirmation dialogs to ensure immediate focus transfer, reliable keydown handling, and proper screen reader feedback.
