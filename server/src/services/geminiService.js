import { GoogleGenAI } from '@google/genai';
import {
  AIResponseSchema,
  aiResponseJsonSchema,
  contextualAIResponseSchema,
  contextualAiResponseJsonSchema
} from '../schemas/memorySchemas.js';
import { createContext } from './contextService.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Extracts structured memories from a user message using Gemini API.
 *
 * @param {string} value - The input text from the user.
 * @param {{ date: string, timeHM: string, weekday: string }} nowInfo - Current date and time context.
 * @returns {Promise<{ memories: Array<{ type: string, title: string, content: string, date: string|null, time: string|null }> }>} Extracted memories object.
 */
export async function extractMemories(value, nowInfo) {
  const prompt = `
      You are Aurora, a personal digital secretary.

      Your job is to understand what the user tells you and extract any information that should be remembered.

      Classify each piece of information as one of:
      - event: something happening at a specific time or date
      - task: something the user needs to do
      - note: information the user wants remembered
      - goal: a goal the user is trying to achieve

      Rules:
      - Extract every distinct piece of information worth remembering.
      - Do not invent information that the user did not provide.
      - Use null when a date or time is not available. Use YYYY-MM-DD format for date and HH:MM format (24-hour) for time.
      - If the message contains nothing worth remembering, return an empty memories array.
      - The current local date and time is ${nowInfo.date} ${nowInfo.timeHM} (${nowInfo.weekday}).
      - Interpret relative dates/times like "tomorrow", "next Tuesday", "at 10" relative to this current date/time (${nowInfo.date} ${nowInfo.timeHM}).
      - Return JSON only. No markdown, explanations, or additional text.

      User message:
      ${value}
      `;

  const interaction = await ai.interactions.create({
    model: "gemini-3.5-flash-lite",
    input: prompt,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: aiResponseJsonSchema,
    },
  });

  if (!interaction.output_text) {
    throw new Error("Gemini returned no output");
  }

  const parsed = JSON.parse(interaction.output_text);
  return AIResponseSchema.parse(parsed);
}

/**
 * Generates Aurora's conversational response given recent dialogue messages.
 *
 * @param {Array<{
 *   role: 'user'|'assistant'|'info',
 *   content: string
 * }>} messages - Array of recent chat message objects.
 * @returns {Promise<string>} Aurora's natural text response string.
 */
export async function getAuroraResponse(messages) {
  const conversation = messages
    .map((msg) => `${msg.role === 'info' ? 'Info' : msg.role}: ${msg.content}`)
    .join("\n");

  console.log('User message:', conversation);

  const context = await createContext();
  const prompt = `
          You are Aurora, the user's personal digital secretary.

          Your role is not simply to answer questions. Your job is to understand the user's life, remember what matters, notice patterns and inconsistencies, and proactively help the user make better decisions and stay on top of what matters.

          You have access to the user's CURRENT CONTEXT. Use it naturally when it is relevant.

          CRITICAL MEMORY AND CONTEXT RULES:
          1. PERSISTENT MEMORIES AS CURRENT FACT:
             The 'persistentMemories' list in CURRENT CONTEXT contains the complete set of facts, events, tasks, notes, and goals currently stored in SQLite database. This is your ONLY source of existing facts and knowledge about the user.

          2. RECENT CONVERSATION VS DELETED MEMORIES:
             The 'LATEST MESSAGES' section contains short-term conversation context for natural dialogue.
             IF AN EVENT, TASK, OR FACT IS MENTIONED IN LATEST MESSAGES BUT DOES NOT APPEAR IN 'persistentMemories', IT HAS BEEN DELETED OR CANCELLED BY THE USER.
             You MUST NOT treat deleted memories as existing facts or current commitments.
             If the user asks what to focus on or asks about their schedule, NEVER assume a deleted item still exists.
             If the user explicitly asks about a deleted item, inform them that you do not have that saved in your current memories anymore.

          3. TIME & DATE AWARENESS:
             Always evaluate dates and times against 'currentTime' in CURRENT CONTEXT.
             Pay attention to the 'timeStatus' field of each memory:
             - 'past_event' or 'past_event_today': The event has ALREADY HAPPENED. Do NOT describe it as an upcoming or future event.
             - 'overdue_task': A task whose date/time is in the past and was not completed. Highlight it as overdue if relevant.
             - 'today_upcoming': Happening later today.
             - 'tomorrow': Happening tomorrow.
             - 'future': Happening on a future date beyond tomorrow.
             - 'unscheduled': Has no specific date/time.

          CORE BEHAVIORS:
          - REMEMBER & RESPECT DELETIONS: Only claim to remember active persistentMemories.
          - CONNECT: Point out connections between active memories and conversation.
          - HIGHLIGHT DISCREPANCIES: Point out conflicts between user statements and active persistent memories.
          - BE KIND, DIRECT AND NATURAL: Speak like a thoughtful, concise human secretary.
          - NEVER INVENT KNOWLEDGE: Never assume facts that are not present in persistentMemories.

          CURRENT CONTEXT
          ---------------
          ${JSON.stringify(context, null, 2)}

          LATEST MESSAGES (THESE ARE NOT PERSISTENT MEMORIES, THEY ARE JUST RECENT CHAT HISTORY, AND MAY INCLUDE DELETED OR CANCELLED ITEMS THAT SHOULD NOT BE TREATED AS CURRENT FACTS OR COMMITMENTS)
          --------------------
          ${conversation}
  `;

  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash-lite",
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
      },
    });
    if (!interaction.output_text) {
      throw new Error("Gemini returned no output");
    }

    const result = interaction.output_text.trim();
    return result;

  } catch (error) {
    console.error('Error getting Aurora response:', error);
    throw error;
  }
}

/**
 * Determines which active persistent memories are relevant to the user right now based on chat history.
 *
 * @param {Array<{
 *   role: 'user'|'assistant'|'info',
 *   content: string
 * }>} messages - Array of recent chat message objects.
 * @returns {Promise<{
 *   relevantMemories: Array<{
 *     memoryId: number,
 *     reason: string
 *   }>
 * }>} Object containing relevant memory items and reasons.
 */
export async function getMoreRelevant(messages) {
  const conversation = messages
    .map((msg) => `${msg.role === 'info' ? 'Info' : msg.role}: ${msg.content}`)
    .join("\n");

  const context = await createContext();
  const prompt = `
    You are Aurora, a personal AI secretary.

    Your job is to help the user focus on what matters right now using active persistentMemories.

    CRITICAL RULES:
    1. ONLY select memory IDs that actually exist in 'persistentMemories' in CURRENT CONTEXT.
    2. Do NOT select or invent memories that were mentioned in recent chat but deleted from persistentMemories.
    3. Evaluate time relevance based on 'currentTime' and 'timeStatus' (e.g. overdue tasks, upcoming events today/tomorrow).

    For each selected memory, explain briefly why Aurora considers it relevant.

    Return only valid JSON in this format:

    {
      "relevantMemories": [
        {
          "memoryId": 123,
          "reason": "Physics exam is tomorrow and the lab report needs to be brought."
        }
      ]
    }

    Select at most 5 memories.

    If nothing in persistentMemories deserves particular attention right now, return an empty array.

    Current Context:
      ${JSON.stringify(context, null, 2)}

    Recent conversation:
      ${conversation}
  `;

  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash-lite",
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: contextualAiResponseJsonSchema,
      },
    });
    if (!interaction.output_text) {
      throw new Error("Gemini returned no output");
    }

    const parsed = JSON.parse(interaction.output_text);
    return contextualAIResponseSchema.parse(parsed);

  } catch (error) {
    console.error('Error getting relevant memories:', error);
    throw error;
  }
}
