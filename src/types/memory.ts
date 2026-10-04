/**
 * Domain types for Aurora frontend application.
 */

export type MemoryType = 'event' | 'task' | 'note' | 'goal' | 'personal' | 'preference' | 'idea';

/**
 * Represents a saved memory item.
 */
export interface Memory {
  id: number;
  type: string;
  title: string;
  content: string;
  date?: string;
  time?: string;
}

/**
 * Represents a chat message item in the conversation history.
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'info';
  content: string;
}

/**
 * Represents a relevant memory item returned by the AI.
 */
export interface RelevantMemory {
  memoryId: number;
  reason: string;
}

/**
 * Represents daily breakdown memory summary item.
 */
export interface DailyBreakdownItem {
  type: 'event' | 'task' | 'note' | 'idea';
  title: string;
  content: string;
  date: string | null;
  time: string | null;
}

/**
 * Represents upcoming event summary item.
 */
export interface UpcomingEventItem {
  type: 'event' | 'task' | 'note';
  title: string;
  content: string;
  date: string | null;
  time: string | null;
}

/**
 * Represents goal summary item.
 */
export interface GoalItem {
  title: string;
  content: string;
  date: string | null;
  time: string | null;
}
