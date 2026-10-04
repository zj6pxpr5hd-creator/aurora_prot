/**
 * Brain icon component used for Aurora memories toggle.
 */
export const BrainIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M9.5 4.5a3 3 0 0 0-5.5 1.6A3.2 3.2 0 0 0 4.7 12a3.1 3.1 0 0 0 1.6 5.8A3 3 0 0 0 12 19V7.5a3 3 0 0 0-2.5-3Z" />
    <path d="M14.5 4.5a3 3 0 0 1 5.5 1.6 3.2 3.2 0 0 1-.7 5.9 3.1 3.1 0 0 1-1.6 5.8A3 3 0 0 1 12 19V7.5a3 3 0 0 1 2.5-3Z" />
    <path d="M8 8.5c1.2 0 2 .8 2 2M16 8.5c-1.2 0-2 .8-2 2M8 15.5c1.2 0 2-.8 2-2M16 15.5c-1.2 0-2-.8-2-2" />
  </svg>
);

/**
 * Spinner icon component used for loading and pending states.
 */
export const SpinnerIcon = () => (
  <svg
    className="spinner-icon"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
    <path d="M12 3a9 9 0 0 1 9 9" />
  </svg>
);

/**
 * Relevance icon component used for relevant memories toggle.
 */
export const RelevanceIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M12 4v10" />
    <path d="M12 18h.01" />
    <path d="M4.5 7.5l2 2" />
    <path d="M19.5 7.5l-2 2" />
    <path d="M3 14h2" />
    <path d="M19 14h2" />
  </svg>
);
