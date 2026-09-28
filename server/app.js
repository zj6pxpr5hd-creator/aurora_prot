import express from 'express';
import cors from 'cors';
import * as z from 'zod';
import "dotenv/config";
import { GoogleGenAI } from '@google/genai';
import db from './src/db/database.js';
import {
  getCurrentTimeInfo,
  categorizeMemoryTime,
  calculateMinutesUntil,
  getUpcomingEventsDB,
  getUndatedEventsAndTasksDB,
  getUserGoalsDB,
  getMemoriesForTodayDB,
  getAllMemoriesDB
} from './src/timeUtils.js';

const app = express();
const port = 3000;
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const MemorySchema = z.object({
  type: z.enum(["event", "task", "note", "goal"]),
  title: z.string(),
  content: z.string(),
  date: z.string().nullable(),
  time: z.string().nullable(),
});

const AIResponseSchema = z.object({
  memories: z.array(MemorySchema),
});

const aiResponseJsonSchema = {
  type: "object",
  properties: {
    memories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["event", "task", "note", "goal"],
          },
          title: {
            type: "string",
          },
          content: {
            type: "string",
          },
          date: {
            type: ["string", "null"],
          },
          time: {
            type: ["string", "null"],
          },
        },
        required: ["type", "title", "content", "date", "time"],
      },
    },
  },
  required: ["memories"],
};

const contextualAIResponseSchema = z.object({
  relevantMemories: z.array(z.object({
    memoryId: z.number(),
    reason: z.string(),
  })),
});

const contextualAiResponseJsonSchema = {
  type: "object",
  properties: {
    relevantMemories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          memoryId: {
            type: "number",
          },
          reason: {
            type: "string",
          },
        },
        required: ["memoryId", "reason"],
      },
    },
  },
  required: ["relevantMemories"],
};

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    console.log('Received request at /');
    res.send('Aurora server is running');
});

app.post('/memory', async (req, res) => {
    console.log('Received request at /memory');

    const value = req.body.value;
    const messages = req.body.messages || [];
    const nowInfo = getCurrentTimeInfo();

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

      try {
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
        const result = AIResponseSchema.parse(parsed);

        for (const memory of result.memories) {
          db.prepare(`
            INSERT INTO memories (type, title, content, date, time)
            VALUES (?, ?, ?, ?, ?)
          `).run(
            memory.type,
            memory.title,
            memory.content,
            memory.date,
            memory.time
          );
        }

        const AuroraResponse = await getAuroraResponse(messages);

        res.json({ result: result, AuroraResponse: AuroraResponse });

      } catch (error) {
        console.error('Error creating memory:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
});

app.get('/memory', async (req, res) => {
  console.log('Recieved request at /memory');
  try{
    const memories = getAllMemoriesDB();
    res.json({ memories });

  }catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/memory/today', async (req, res) => {
  console.log('Recieved request at /memory/today');
  try{
    const nowInfo = getCurrentTimeInfo();
    const memories = getMemoriesForTodayDB(nowInfo);
    res.json({ memories });

  }catch (error){
    console.error('Error fetching today\'s memories: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/memory/upcoming', async (req, res) => {
  console.log('Recieved request at /memory/upcoming');

  try{
    const nowInfo = getCurrentTimeInfo();
    const upcoming = getUpcomingEventsDB(nowInfo);
    res.json({ upcoming });

  }catch(error){
    console.error('Error fetching upcoming memories: ', error);
    res.status(500).json({ error: 'internal server error while retrieving upcoming events' });
  }
});

app.get('/context', async (req, res) => {
  console.log('Recieved request at /context');
  try {
    const context = await createContext();
    res.json(context);
  } catch (error) {
    console.error('Error building context: ', error);
    res.status(500).json({ error: 'internal server error while building context' });
  }
});

/**
 * Builds the comprehensive current context payload for Aurora, including current date/time,
 * active persistent memories with time statuses, upcoming events, undated items, and user goals.
 *
 * @returns {Promise<{
 *   currentTime: {
 *     timeZone: string,
 *     date: string,      // Format: 'YYYY-MM-DD'
 *     time: string,      // Format: 'HH:MM'
 *     datetime: string,  // Format: 'YYYY-MM-DD HH:MM:SS'
 *     weekday: string    // e.g. 'Monday'
 *   },
 *   persistentMemories: Array<{
 *     id: number,
 *     type: string,      // 'event', 'task', 'note', or 'goal'
 *     title: string,
 *     content: string,
 *     date: string|null, // Format: 'YYYY-MM-DD' or null
 *     time: string|null, // Format: 'HH:MM' or null
 *     timeStatus: string // 'unscheduled', 'overdue_task', 'past_event', 'past_event_today', 'today_upcoming', 'tomorrow', 'future'
 *   }>,
 *   upcomingEventsNextHour: Array<object>,
 *   nextEvent: object|null,
 *   unscheduledItems: Array<object>,
 *   goals: Array<object>
 * }>} Object containing complete structured context.
 */
async function createContext(){
  const nowInfo = getCurrentTimeInfo();
  let upcoming = [];  
  let undated = [];
  let goals = [];
  let allMemories = [];

  try {
    upcoming = getUpcomingEventsDB(nowInfo);
    undated = getUndatedEventsAndTasksDB();
    goals = getUserGoalsDB();
    allMemories = getAllMemoriesDB();
  } catch (error) {
    console.error('Error fetching memories for context: ', error);
    throw error;
  }

  let nextEvent = upcoming.length > 0 ? upcoming[0] : null;
  if(nextEvent){
    nextEvent = {
      ...nextEvent,
      minutesUntil: calculateMinutesUntil(nextEvent.date, nextEvent.time, nowInfo)
    };
  }

  const persistentMemories = allMemories.map(mem => ({
    id: mem.id,
    type: mem.type,
    title: mem.title,
    content: mem.content,
    date: mem.date,
    time: mem.time,
    timeStatus: categorizeMemoryTime(mem, nowInfo)
  }));

  return {
    currentTime: {
      timeZone: nowInfo.timeZone,
      date: nowInfo.date,
      time: nowInfo.timeHM,
      datetime: nowInfo.datetime,
      weekday: nowInfo.weekday
    },
    persistentMemories: persistentMemories,
    upcomingEventsNextHour: upcoming,
    nextEvent: nextEvent,
    unscheduledItems: undated,
    goals: goals,
  };
}

/**
 * Wraps createContext result into a context container object.
 *
 * @returns {Promise<{
 *   context: object
 * }>} Object containing context data.
 */
async function createFullContext(){
  const context = await createContext();
  return {
    context: context,
  };
} 

/**
 * Fetches user goals from database.
 *
 * @returns {Promise<Array<{
 *   id: number,
 *   type: string,      // 'goal'
 *   title: string,
 *   content: string,
 *   date: string|null,
 *   time: string|null,
 *   created_at: string
 * }>>} Array of user goal objects.
 */
async function getUserGoals(){
  return getUserGoalsDB();
}

app.get('/goals', async (req, res) => {
  console.log('Recieved request at /goals');
  try{
    const goals = await getUserGoals();
    res.json({ goals });

  }catch(error){
    console.error('Error fetching user goals: ', error);
    res.status(500).json({ error: 'internal server error while retrieving user goals' });
  }
});

/**
 * Generates Aurora's conversational response given recent dialogue messages.
 *
 * @param {Array<{
 *   role: 'user'|'assistant'|'info',
 *   content: string
 * }>} messages - Array of recent chat message objects.
 * @returns {Promise<string>} Aurora's natural text response string.
 */
async function getAuroraResponse(messages){
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

          LATEST MESSAGES
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

      } catch (error){
        console.error('Error getting Aurora response:', error);
        throw error;
      } 
}

app.delete('/memory', async (req, res) => {
  console.log('Recieved request at /memory DELETE');
  try{
    db.prepare('DELETE FROM memories').run();
    res.json({ message: 'All memories deleted' });

  }catch (error) {
    console.error('Error deleting memories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/memory/:id', async (req, res) => {
  console.log('Recieved request at /memory/:id DELETE');
  try{
    const { id } = req.params;
    const memory = db.prepare('SELECT * FROM memories WHERE id = ?').get(id);
    if (!memory) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }

    db.prepare('DELETE FROM memories WHERE id = ?').run(id);

    let details = memory.title;
    if (memory.date || memory.time) {
      const dateTimeParts = [];
      if (memory.date) dateTimeParts.push(`on ${memory.date}`);
      if (memory.time) dateTimeParts.push(`at ${memory.time}`);
      details += ` ${dateTimeParts.join(' ')}`;
    }

    const infoMessageText = `Memory deleted: ${details.trim()}`;

    res.json({
      type: "info",
      action: "memory_deleted",
      memory: memory,
      message: infoMessageText
    });

  }catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/memory/:id', async (req, res) => {
  console.log('Recieved request at /memory/:id GET');
  try{
    const { id } = req.params;
    const memory = db.prepare('SELECT * FROM memories WHERE id = ?').get(id);
    if (!memory) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }
    res.json({ memory });

  }catch (error) {
    console.error('Error fetching memory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/memory/:id', async (req, res) => {
  console.log('Recieved request at /memory/:id PATCH');
  try{
    const { id } = req.params;
    const { type, title, content, date, time } = req.body;

    const oldMemory = db.prepare('SELECT * FROM memories WHERE id = ?').get(id);
    if (!oldMemory) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }

    db.prepare(`
      UPDATE memories
      SET type = ?, title = ?, content = ?, date = ?, time = ?
      WHERE id = ?
    `).run(type, title, content, date, time, id);

    const updatedMemory = db.prepare('SELECT * FROM memories WHERE id = ?').get(id);

    const changes = [];
    if (oldMemory.title !== updatedMemory.title) {
      changes.push(`title changed to "${updatedMemory.title}"`);
    }
    if (oldMemory.time !== updatedMemory.time && oldMemory.date === updatedMemory.date) {
      const oldTime = oldMemory.time || 'no time';
      const newTime = updatedMemory.time || 'no time';
      changes.push(`moved from ${oldTime} to ${newTime}`);
    } else {
      if (oldMemory.date !== updatedMemory.date) {
        const oldDate = oldMemory.date || 'no date';
        const newDate = updatedMemory.date || 'no date';
        changes.push(`date changed from ${oldDate} to ${newDate}`);
      }
      if (oldMemory.time !== updatedMemory.time) {
        const oldTime = oldMemory.time || 'no time';
        const newTime = updatedMemory.time || 'no time';
        changes.push(`time changed from ${oldTime} to ${newTime}`);
      }
    }
    if (oldMemory.content !== updatedMemory.content) {
      changes.push(`content updated`);
    }
    if (oldMemory.type !== updatedMemory.type) {
      changes.push(`type changed to ${updatedMemory.type}`);
    }

    const changeDescription = changes.length > 0 ? changes.join(', ') : 'details updated';
    const infoMessageText = `Memory updated: ${updatedMemory.title} (${changeDescription}).`;

    res.json({
      type: "info",
      action: "memory_updated",
      oldMemory: oldMemory,
      memory: updatedMemory,
      message: infoMessageText
    });

  }catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
async function getMoreRelevant(messages){
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
        const result = contextualAIResponseSchema.parse(parsed);

        return result;

      } catch (error){
        console.error('Error getting relevant memories:', error);
        throw error;
      } 
}

app.post('/relevant', async (req, res) => {
  console.log('Recieved request at /relevant');
  const messages = req.body.messages || [];
  try{
    const relevant = await getMoreRelevant(messages);
    res.json({ relevant });

  }catch(error){
    console.error('Error fetching relevant memories: ', error);
    res.status(500).json({ error: 'internal server error while retrieving relevant memories' });
  }
});

app.listen(port, () => {
    console.log(`Aurora listening at http://localhost:${port}`);
});
