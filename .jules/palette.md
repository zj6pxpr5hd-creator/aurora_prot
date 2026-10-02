# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-09-30 - Accessible Action Spinner Buttons
**Learning:** For async submit/action buttons, replacing static "Saving..." text with an inline SVG loading spinner alongside descriptive text and explicit `aria-busy={isSaving}` + dynamic `aria-label` prevents screen reader state confusion while providing immediate visual feedback to sighted users.
**Action:** Always combine `aria-busy`, dynamic `aria-label` updates ("Saving message..." vs "Send message"), and reduced-motion compliant CSS keyframe animations when adding loading spinners to action buttons.
