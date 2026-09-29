import type { RefObject } from 'react';
import type { ChatMessage } from '../types/memory';

interface ConversationSectionProps {
  messages: ChatMessage[];
  value: string;
  isSaving: boolean;
  error: string;
  conversationEndRef: RefObject<HTMLDivElement | null>;
  onValueChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/**
 * Renders the conversation stream and input composer component.
 *
 * @param messages Array of chat messages.
 * @param value Current input field value.
 * @param isSaving Whether memory creation request is pending.
 * @param error Error message string for composer error.
 * @param conversationEndRef Ref to bottom of conversation for auto-scroll.
 * @param onValueChange Input change event handler.
 * @param onSubmit Form submit handler for creating a memory.
 */
export function ConversationSection({
  messages,
  value,
  isSaving,
  error,
  conversationEndRef,
  onValueChange,
  onSubmit,
}: ConversationSectionProps) {
  return (
    <>
      <section className="conversation" aria-live="polite">
        {messages.length > 0 ? (
          <div className="conversation-messages">
            {messages.map((msg, index) => {
              if (msg.role === 'user') {
                return (
                  <div key={index} className="user-message-bubble">
                    {msg.content}
                  </div>
                );
              }
              if (msg.role === 'info') {
                return (
                  <div key={index} className="info-message-bubble">
                    <span className="info-message-tag">Info</span>
                    {msg.content}
                  </div>
                );
              }
              return (
                <p key={index} className="aurora-response-bubble">
                  {msg.content}
                </p>
              );
            })}
            <div ref={conversationEndRef} />
          </div>
        ) : (
          <div className="conversation-empty">
            <p className="eyebrow">A clear place to begin</p>
            <h2>Tell Aurora what you want to remember.</h2>
          </div>
        )}
      </section>

      <div className="composer-wrap">
        <form className="composer" onSubmit={onSubmit}>
          <input
            aria-label="Message Aurora"
            type="text"
            placeholder="e.g. Call Mum tomorrow at 6pm"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            disabled={isSaving}
          />
          <button type="submit" aria-label="Send message" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Send'} {!isSaving && <span aria-hidden="true">&#8594;</span>}
          </button>
        </form>
        {error && <p>{error}</p>}
      </div>
    </>
  );
}
