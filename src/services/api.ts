import type { Memory, ChatMessage, DailyBreakdownItem, UpcomingEventItem, GoalItem, RelevantMemory } from '../types/memory';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * Fetches all memories stored in the backend database.
 *
 * @param signal Optional AbortSignal for request cancellation.
 * @returns Promise resolving to list of Memory objects.
 */
export async function fetchMemoriesApi(signal?: AbortSignal): Promise<Memory[]> {
  const response = await fetch(`${API_BASE_URL}/memory`, { signal });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.memories || [];
}

/**
 * Sends user text input to backend to extract memories and receive Aurora AI response.
 *
 * @param value User input string.
 * @param messages Recent chat messages history.
 * @returns Promise resolving to Aurora AI response text.
 */
export async function createMemoryApi(value: string, messages: ChatMessage[]): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/memory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value, messages: messages.slice(-10) }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.AuroraResponse;
}

/**
 * Deletes a memory item by ID from the backend database.
 *
 * @param id Memory ID to delete.
 * @returns Promise resolving to server info message if available.
 */
export async function deleteMemoryApi(id: number): Promise<string | undefined> {
  const response = await fetch(`${API_BASE_URL}/memory/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.message;
}

/**
 * Updates an existing memory item in the backend database.
 *
 * @param draft Updated Memory object.
 * @returns Promise resolving to server info message if available.
 */
export async function updateMemoryApi(draft: Memory): Promise<string | undefined> {
  const response = await fetch(`${API_BASE_URL}/memory/${draft.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(draft),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.message;
}

/**
 * Fetches memories scheduled for today.
 *
 * @param signal Optional AbortSignal for request cancellation.
 * @returns Promise resolving to list of DailyBreakdownItem objects.
 */
export async function fetchDailyBreakdownApi(signal?: AbortSignal): Promise<DailyBreakdownItem[]> {
  const response = await fetch(`${API_BASE_URL}/memory/today`, { signal });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.memories;
}

/**
 * Fetches user goals from backend database.
 *
 * @param signal Optional AbortSignal for request cancellation.
 * @returns Promise resolving to list of GoalItem objects.
 */
export async function fetchGoalsApi(signal?: AbortSignal): Promise<GoalItem[]> {
  const response = await fetch(`${API_BASE_URL}/goals`, { signal });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.goals;
}

/**
 * Fetches upcoming event memories scheduled in the next hour.
 *
 * @param signal Optional AbortSignal for request cancellation.
 * @returns Promise resolving to list of UpcomingEventItem objects.
 */
export async function fetchUpcomingEventsApi(signal?: AbortSignal): Promise<UpcomingEventItem[]> {
  const response = await fetch(`${API_BASE_URL}/memory/upcoming`, { signal });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();
  return data.upcoming;
}

/**
 * Fetches relevant memories for current context based on recent messages history.
 *
 * @param messages Recent chat messages history.
 * @param signal Optional AbortSignal for request cancellation.
 * @returns Promise resolving to list of RelevantMemory objects.
 */
export async function fetchRelevantMemoriesApi(messages: ChatMessage[], signal?: AbortSignal): Promise<RelevantMemory[]> {
  const response = await fetch(`${API_BASE_URL}/relevant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: messages.slice(-10),
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.relevant.relevantMemories;
}
