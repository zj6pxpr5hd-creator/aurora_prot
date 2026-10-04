import type { Memory } from '../types/memory';
import { updateMemoryApi } from '../services/api';
import { useState } from 'react';

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

  const updateDraft = (field: keyof Memory, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const infoMessage = await updateMemoryApi(draft);
      console.log(`Memory with id ${draft.id} updated successfully.`);
      onSave(draft, infoMessage);
    } catch (error) {
      console.error('Error editing memory:', error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Escape') {
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
      <label>
        Title
        <input autoFocus value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} required />
      </label>
      <label>
        Content
        <textarea value={draft.content} onChange={(event) => updateDraft('content', event.target.value)} required rows={4} />
      </label>
      <div className="memory-editor-fields">
        <label>
          Date
          <input type="date" value={draft.date ?? ''} onChange={(event) => updateDraft('date', event.target.value)} />
        </label>
        <label>
          Time
          <input type="time" value={draft.time ?? ''} onChange={(event) => updateDraft('time', event.target.value)} />
        </label>
      </div>
      <div className="memory-editor-actions">
        <button type="submit">Save changes</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
