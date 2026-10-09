import type { Memory } from '../types/memory';
import { updateMemoryApi } from '../services/api';
import { useState } from 'react';
import { SpinnerIcon } from './Icons';

interface MemoryEditorProps {
  memory: Memory;
  onSave: (memory: Memory, infoMessage?: string) => void;
  onCancel: () => void;
}

/**
 * Form editor component to edit title, content, date, and time of a memory.
 *
 * @param memory Current memory state to edit.
 * @param onSave Callback handler invoked with updated memory and server info message.
 * @param onCancel Callback handler when editing is cancelled.
 */
export function MemoryEditor({ memory, onSave, onCancel }: MemoryEditorProps) {
  const [draft, setDraft] = useState(memory);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const updateDraft = (field: keyof Memory, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const infoMessage = await updateMemoryApi(draft);
      console.log(`Memory with id ${draft.id} updated successfully.`);
      onSave(draft, infoMessage);
    } catch (err) {
      console.error('Error editing memory:', err);
      setError('Failed to save memory changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Escape' && !isSaving) {
      onCancel();
    }
  };

  return (
    <form
      className="memory-editor"
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      aria-label={`Edit memory: ${memory.title}`}
    >
      {error && (
        <p className="section-error" role="alert">
          {error}
        </p>
      )}
      <label htmlFor="edit-memory-title">
        Title
        <input
          id="edit-memory-title"
          autoFocus
          value={draft.title}
          onChange={(event) => updateDraft('title', event.target.value)}
          disabled={isSaving}
          required
        />
      </label>
      <label htmlFor="edit-memory-content">
        Content
        <textarea
          id="edit-memory-content"
          value={draft.content}
          onChange={(event) => updateDraft('content', event.target.value)}
          disabled={isSaving}
          required
          rows={4}
        />
      </label>
      <div className="memory-editor-fields">
        <label htmlFor="edit-memory-date">
          Date
          <input
            id="edit-memory-date"
            type="date"
            value={draft.date ?? ''}
            onChange={(event) => updateDraft('date', event.target.value)}
            disabled={isSaving}
          />
        </label>
        <label htmlFor="edit-memory-time">
          Time
          <input
            id="edit-memory-time"
            type="time"
            value={draft.time ?? ''}
            onChange={(event) => updateDraft('time', event.target.value)}
            disabled={isSaving}
          />
        </label>
      </div>
      <div className="memory-editor-actions">
        <button type="submit" disabled={isSaving} aria-busy={isSaving}>
          {isSaving ? (
            <>
              <SpinnerIcon />
              <span>Saving...</span>
            </>
          ) : (
            'Save changes'
          )}
        </button>
        <button type="button" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
