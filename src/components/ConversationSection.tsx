import { memo } from 'react';
import type { RefObject } from 'react';
import type { ChatMessage } from '../types/memory';
import { SpinnerIcon } from './Icons';

interface MessageListProps {
  messages: ChatMessage[];
  conversationEndRef: RefObject<HTMLDivElement | null>;
}

/**
 * Renders the list of conversation messages.
 * Performance Optimization: Wrapped with React.memo to isolate message list DOM rendering.
 * Prevents re-rendering the entire message stream on every keystroke when typing in the input composer.
 *
 * @param messages Array of chat messages in conversation history.
 * @param conversationEndRef Ref to bottom of conversation for auto-scroll.
 * @returns JSX Element representing the message list or empty state.
 */
const MessageList = memo(function MessageList({ messages, conversationEndRef }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="conversation-empty">
        <p className="eyebrow">A clear place to begin</p>
        <h2>Tell Aurora what you want to remember.</h2>
      </div>
    );
  }

  return (
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
  );
});

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
 * Performance Optimization: Wrapped with React.memo to prevent re-rendering when parent state updates
 * unrelated to conversation props. Internal MessageList is also memoized so composer input changes
 * do not trigger re-renders of the chat message list.
 *
 * @param messages Array of chat messages in conversation history.
 * @param value Current input text field value.
 * @param isSaving Whether memory creation request is pending.
 * @param error Error message string for composer error.
 * @param conversationEndRef Ref to bottom of conversation for auto-scroll.
 * @param onValueChange Input change event handler callback.
 * @param onSubmit Form submit handler callback for creating a memory.
 * @returns JSX Element representing the conversation view and composer input.
 */
export const ConversationSection = memo(function ConversationSection({
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
        <MessageList messages={messages} conversationEndRef={conversationEndRef} />
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
          <button
            type="submit"
            aria-label={isSaving ? 'Saving message...' : 'Send message'}
            aria-busy={isSaving}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <SpinnerIcon />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <span aria-hidden="true">&#8594;</span>
              </>
            )}
          </button>
        </form>
        {error && <p>{error}</p>}
      </div>
    </>
  );
});
