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

    const prompt = `
      You are Aurora, a personal digital secretary.

      Your job is to understand what the user tells you and extract any information that should be remembered.

      Classify each piece of information as one of:
      - event: something happening at a specific time or date
      - task: something the user needs to do
      - note: information the user wants remembered
      - idea: an idea the user wants to keep

      Rules:
      - Extract every distinct piece of information worth remembering.
      - Do not invent information that the user did not provide.
      - Use null when a date or time is not available.
      - If the message contains nothing worth remembering, return an empty memories array.
      - The current date is ${new Date().toISOString().split("T")[0]}.
      - Return JSON only. No markdown, explanations, or additional text.

      User message:
      ${value}
      `;

    const MemorySchema = z.object({
      type: z.enum(["event", "task", "note", "idea"]),
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
                enum: ["event", "task", "note", "idea"],
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

        res.json(result);

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
    
    const upcoming = db
          .prepare(`
            SELECT *
                FROM memories
                WHERE type IN ('event', 'task')
                  AND datetime(date || ' ' || time) 
                      BETWEEN datetime('now', 'localtime') 
                      AND datetime('now', '+1 hour', 'localtime')
                ORDER BY date ASC, time ASC
          `)
          .all();
    
    res.json({ upcoming });

  }catch(error){
    console.error('Error fetching upcoming memories: ', error);
    res.status(500).json({ error: 'internal server error' });
  }
});




app.listen(port, () => {
    console.log(`Aurora listening at http://localhost:${port}`);
});

