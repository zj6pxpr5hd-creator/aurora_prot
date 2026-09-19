import express from 'express';
import cors from 'cors';
import * as z from 'zod';
import "dotenv/config";
import { GoogleGenAI } from '@google/genai';
import db from './src/db/database.js';

const app = express();
const port = 3000;
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

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
    const d = new Date();
    const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

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
      - Use null when a date or time is not available.
      - If the message contains nothing worth remembering, return an empty memories array.
      - The current date is ${localDate}.
      - Return JSON only. No markdown, explanations, or additional text.

      User message:
      ${value}
      `;

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


      try {
        //GEMINI API CALL
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

        //save memories to memories table in database
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

        //get Aurora's text response to the user message
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
    const memories = db
    .prepare('SELECT * FROM memories ORDER BY created_at DESC')
    .all();

    res.json({ memories })

  }catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

app.get('/memory/today', async (req, res) => {
  console.log('Recieved request at /memory/today');
  try{
    const today = new Date().toISOString().split("T")[0];
    const memories = db
    .prepare('SELECT * FROM memories WHERE date = ? ORDER BY created_at ASC')
    .all(today);

    res.json({ memories });

  }catch (error){
    console.error('Error fetching today\'s memories: ', error);
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/memory/upcoming', async (req, res) => {
  console.log('Recieved request at /memory/upcoming');

  try{
    const upcoming = getUpcomingEvents();
    res.json({ upcoming });

  }catch(error){
    console.error('Error fetching upcoming memories: ', error);
    res.status(500).json({ error: 'internal server error while retrieving upcoming events' });
  }

});

// CONTEXT ENDPOINT 
app.get('/context', async (req, res) => {

  console.log('Recieved request at /context');
  let upcoming = [];

  try{
    upcoming = getUpcomingEvents();

  }catch(error){
    console.error('Error fetching upcoming memories: ', error);
    res.status(500).json({ error: 'internal server error while retrieving upcoming events' });
  }

  let nextEvent = upcoming.length > 0 ? upcoming[0] : null;
  if(nextEvent){
    nextEvent['minutesUntil'] = nextEvent ? Math.floor((new Date(nextEvent.date + ' ' + nextEvent.time) - new Date()) / 60000) : null;
  }

  const undated = getUndatedEventsAndTasks();

  res.json({
    now: new Date().toISOString(),
    upcomingEvents: upcoming,
    nextEvent: nextEvent,
    unscheduledItems: undated
  })

})

async function getUpcomingEvents() {
    const upcoming = await db
          .prepare(`
            SELECT *
                FROM memories
                WHERE type IN ('event')
                  AND datetime(date || ' ' || time) 
                      BETWEEN datetime('now', 'localtime') 
                      AND datetime('now', '+1 hour', 'localtime')
                ORDER BY date ASC, time ASC
          `)
          .all();
    return upcoming;
}

async function getUndatedEventsAndTasks() {
    const upcoming = await db
          .prepare(`
            SELECT *
            FROM memories
            WHERE type IN ('event', 'task')
              AND (
                date IS NULL OR date = ''
                OR time IS NULL OR time = ''
              )
            ORDER BY created_at ASC;
          `)
          .all();
    return upcoming;
}

async function createContext(){
  let upcoming = [];  
  let undated = [];
  let goals = [];

  try{
    upcoming = await getUpcomingEvents();
    undated = await getUndatedEventsAndTasks();
    goals = await getUserGoals();

  }catch(error){
    console.error('Error fetching upcoming memories: ', error);
    return { error: 'internal server error while retrieving upcoming events' };
  }

  let nextEvent = upcoming.length > 0 ? upcoming[0] : null;
  if(nextEvent){
    nextEvent['minutesUntil'] = nextEvent ? Math.floor((new Date(nextEvent.date + ' ' + nextEvent.time) - new Date()) / 60000) : null;
  }

  const d = new Date();

  const localDateTime = 
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ` +
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

  
  return {
    now: localDateTime,
    upcomingEvents: upcoming,
    nextEvent: nextEvent,
    unscheduledItems: undated,
    goals: goals,
  }
}

async function getUserGoals(userInput){
  const goals = db
        .prepare(`
            SELECT *
            FROM memories
            WHERE type IN ('goal')
            ORDER BY created_at ASC;
          `)
          .all();
    return goals;
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

async function getAuroraResponse(messages){

  const conversation = messages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");
  
    console.log('User message:', conversation);

  const context = await createContext();
  const prompt = `
          You are Aurora, the user's personal digital secretary.

          Your role is not simply to answer questions. Your job is to understand the user's life, remember what matters, notice patterns and inconsistencies, and proactively help the user make better decisions and stay on top of what matters.

          You have access to the user's current context. Use it naturally when it is relevant.

          CORE BEHAVIOR:

          1. REMEMBER
          When the user tells you something important, acknowledge it naturally. If it has been saved as a memory, do not ask the user to repeat it later.

          2. CONNECT
          Look for meaningful connections between what the user is saying now and what you already know.
          For example, if the user mentions wanting to save money and later talks about buying something expensive, you may point out the connection.

          3. NOTICE PATTERNS
          If the context reveals a meaningful recurring behavior, bring it up when appropriate.
          Do not invent patterns from insufficient evidence. A single occurrence is not a pattern.

          4. HIGHLIGHT DISCREPANCIES
          If the user's current intentions, statements, or plans appear to conflict with something they previously told you, gently point it out.
          Do not judge or lecture. Make the discrepancy visible and let the user decide what to do.

          5. BE PROACTIVE
          You do not need to wait for a direct question.
          If something in the context is clearly relevant to the user's current message or situation, bring it up.
          However, do not overwhelm the user with information just because you have it.

          6. BE KIND, DIRECT AND NATURAL
          Speak like a thoughtful human secretary who knows the user well.
          Be warm and concise.
          Do not be excessively enthusiastic, robotic, formal, or patronizing.

          7. RESPECT THE USER'S AUTONOMY
          You are a secretary, not a boss.
          You can point out problems, suggest actions, and challenge inconsistencies, but the user makes the final decision.

          8. USE CONTEXT SELECTIVELY
          Do not mention context, memories, databases, or internal processes.
          Do not repeat information unnecessarily.
          Only use information from the context when it helps the current interaction.

          9. NEVER INVENT KNOWLEDGE
          Only claim to remember something if it is actually present in the provided context.
          If you are unsure, say so.

          10. PRIORITIZE RELEVANCE
          A useful response is better than a comprehensive one.
          You do not need to mention every relevant piece of context.

          Your response should feel like it comes from an assistant who has been paying attention to the user's life, rather than from a chatbot responding to an isolated message.

          CURRENT CONTEXT
          ---------------
          ${JSON.stringify(context)}

          LATEST MESSAGES
          --------------------
          ${conversation}

  `;

      try {
        //GEMINI API CALL
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
        console.error('Error creating memory:', error);
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
    db.prepare('DELETE FROM memories WHERE id = ?').run(id);
    res.json({ message: 'Memory deleted' });

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

app.delete('/memory/:created_at', async (req, res) => {
  console.log('Recieved request at /memory/:created_at DELETE');
  try{
    const { created_at } = req.params;
    db.prepare('DELETE FROM memories WHERE created_at = ?').run(created_at);
    res.json({ message: 'Memory deleted' });

  }catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
    console.log(`Aurora listening at http://localhost:${port}`);
});
