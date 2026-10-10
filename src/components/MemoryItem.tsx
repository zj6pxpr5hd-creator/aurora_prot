import type { Memory } from '../types/memory';
import { deleteMemoryApi } from '../services/api';
import { useState } from 'react';
import { SpinnerIcon } from './Icons';

interface MemoryItemProps {
  memory: Memory;
  onEdit: (memory: Memory) => void;
  onDelete: (id: number, infoMessage?: string) => void;
}

/**
 * Individual memory card item rendering memory content, metadata, edit and delete actions.
 *
 * @param memory Memory item object to display.
 * @param onEdit Callback when user clicks edit action.
 * @param onDelete Callback when user confirms deletion.
 */
export function MemoryItem({ memory, onEdit, onDelete }: MemoryItemProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      const infoMessage = await deleteMemoryApi(memory.id);
      console.log(`Memory with id ${memory.id} deleted successfully.`);
      onDelete(memory.id, infoMessage);
    } catch (error) {
      console.error('Error deleting memory:', error);
      setDeleteError('Failed to delete memory. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && !isDeleting) {
      setIsConfirmingDelete(false);
      setDeleteError('');
    }
  };

  return (
    <li className="memory-item">
      <div className="memory-item-header">
        <div>
          <span className="memory-type">{memory.type}</span>
          <h2>{memory.title}</h2>
        </div>
        <div className="memory-actions">
          <button
            type="button"
            aria-label={`Edit memory: ${memory.title}`}
            title={`Edit memory: ${memory.title}`}
            onClick={() => onEdit(memory)}
          >
            Edit
          </button>
          <button
            type="button"
            className="memory-delete-button"
            aria-label={`Delete memory: ${memory.title}`}
            title={`Delete memory: ${memory.title}`}
            onClick={() => {
              setIsConfirmingDelete(true);
              setDeleteError('');
            }}
          >
            Delete
          </button>
        </div>
      </div>
      <p>{memory.content}</p>
      {(memory.date || memory.time) && (
        <div className="memory-meta">
          {memory.date && <time dateTime={memory.date}>{memory.date}</time>}
          {memory.time && <time>{memory.time}</time>}
        </div>
      )}
      {isConfirmingDelete && (
        <div className="memory-delete-confirmation" role="alert" onKeyDown={handleKeyDown}>
          <span>Delete this memory?</span>
          <button
            type="button"
            aria-label={`Confirm deletion of ${memory.title}`}
            aria-busy={isDeleting}
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? (
              <>
                <SpinnerIcon />
                <span>Deleting...</span>
              </>
            ) : (
              'Confirm'
            )}
          </button>
          <button
            type="button"
            aria-label={`Cancel deletion of ${memory.title}`}
            disabled={isDeleting}
            onClick={() => {
              setIsConfirmingDelete(false);
              setDeleteError('');
            }}
          >
            Cancel
          </button>
          {deleteError && (
            <p className="section-error" role="alert">
              {deleteError}
            </p>
          )}
        </div>
      )}
    </li>
  );
}
