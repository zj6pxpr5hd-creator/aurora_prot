import { memo } from 'react';
import { BrainIcon, RelevanceIcon } from './Icons';

interface HeaderProps {
  isMemoriesOpen: boolean;
  isRelevantMemoriesOpen: boolean;
  onToggleMemories: () => void;
  onToggleRelevantMemories: () => void;
}

/**
 * Top navigation header component for Aurora UI.
 * Performance Optimization: Wrapped with React.memo to prevent header re-renders
 * during frequent parent state updates (such as user typing in composer input).
 *
 * @param isMemoriesOpen Whether the general memories view panel is active.
 * @param isRelevantMemoriesOpen Whether the relevant memories view panel is active.
 * @param onToggleMemories Callback handler to toggle general memories view.
 * @param onToggleRelevantMemories Callback handler to toggle relevant memories view.
 */
export const Header = memo(function Header({
  isMemoriesOpen,
  isRelevantMemoriesOpen,
  onToggleMemories,
  onToggleRelevantMemories,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand-mark" aria-hidden="true">A</div>
      <div>
        <p className="eyebrow">Personal memory assistant</p>
        <h1>Aurora</h1>
      </div>

      <span className="status-dot">Ready</span>

      <button
        type="button"
        className="memories-toggle"
        aria-label="Open Aurora memories"
        aria-pressed={isMemoriesOpen}
        title="Open Aurora memories"
        onClick={onToggleMemories}
      >
        <BrainIcon />
      </button>

      <button
        type="button"
        aria-label="Show Memories Aurora find Relevant"
        title="Show Memories Aurora find Relevant"
        className="show-relevant-memories-toggle"
        aria-pressed={isRelevantMemoriesOpen}
        onClick={onToggleRelevantMemories}
      >
        <RelevanceIcon />
      </button>
    </header>
  );
});
