import { Router } from 'express';
import db from '../db/database.js';
import {
  getCurrentTimeInfo,
  getUpcomingEventsDB,
  getMemoriesForTodayDB,
  getAllMemoriesDB
} from '../timeUtils.js';
import { extractMemories, getAuroraResponse } from '../services/geminiService.js';

const router = Router();

// Performance Optimization: Reusable pre-compiled SQL statements at top-level scope.
// Prevents SQL statement compilation overhead (sqlite3_prepare_v2) on every incoming API request.
const stmtInsertMemory = db.prepare(`
  INSERT INTO memories (type, title, content, date, time)
  VALUES (?, ?, ?, ?, ?)
`);

const stmtSelectMemoryById = db.prepare(`
  SELECT * FROM memories WHERE id = ?
`);

const stmtDeleteMemoryById = db.prepare(`
  DELETE FROM memories WHERE id = ?
`);

const stmtDeleteAllMemories = db.prepare(`
  DELETE FROM memories
`);

const stmtUpdateMemoryById = db.prepare(`
  UPDATE memories
  SET type = ?, title = ?, content = ?, date = ?, time = ?
  WHERE id = ?
`);

// Performance Optimization: SQLite Transaction for Batch Inserts.
// Wraps multi-memory insertions in a single transaction (BEGIN ... COMMIT), reducing disk sync
// overhead from O(N fsyncs) to O(1 fsync) when multiple memories are extracted from a message.
const insertMemoriesTx = db.transaction((memories) => {
  for (const memory of memories) {
    stmtInsertMemory.run(
      memory.type,
      memory.title,
      memory.content,
      memory.date,
      memory.time
    );
  }
});

/**
 * POST /memory
 * Processes incoming user message, extracts memories via Gemini API, saves them to DB,
 * and generates conversational Aurora response.
 */
router.post('/memory', async (req, res) => {
  console.log('Received request at /memory');

  const value = req.body.value;
  const messages = req.body.messages || [];
  const nowInfo = getCurrentTimeInfo();

  try {
    const result = await extractMemories(value, nowInfo);

    insertMemoriesTx(result.memories);

    const AuroraResponse = await getAuroraResponse(messages);

    res.json({ result: result, AuroraResponse: AuroraResponse });

  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /memory
 * Retrieves all stored persistent memories from the database.
 */
router.get('/memory', async (req, res) => {
  console.log('Recieved request at /memory');
  try {
    const memories = getAllMemoriesDB();
    res.json({ memories });

  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /memory/today
 * Retrieves memories scheduled for today's date.
 */
router.get('/memory/today', async (req, res) => {
  console.log('Recieved request at /memory/today');
  try {
    const nowInfo = getCurrentTimeInfo();
    const memories = getMemoriesForTodayDB(nowInfo);
    res.json({ memories });

  } catch (error) {
    console.error('Error fetching today\'s memories: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /memory/upcoming
 * Retrieves upcoming event memories within the next hour.
 */
router.get('/memory/upcoming', async (req, res) => {
  console.log('Recieved request at /memory/upcoming');

  try {
    const nowInfo = getCurrentTimeInfo();
    const upcoming = getUpcomingEventsDB(nowInfo);
    res.json({ upcoming });

  } catch (error) {
    console.error('Error fetching upcoming memories: ', error);
    res.status(500).json({ error: 'internal server error while retrieving upcoming events' });
  }
});

/**
 * DELETE /memory
 * Deletes all memories from the database.
 */
router.delete('/memory', async (req, res) => {
  console.log('Recieved request at /memory DELETE');
  try {
    stmtDeleteAllMemories.run();
    res.json({ message: 'All memories deleted' });

  } catch (error) {
    console.error('Error deleting memories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /memory/:id
 * Deletes a specific memory by its ID.
 */
router.delete('/memory/:id', async (req, res) => {
  console.log('Recieved request at /memory/:id DELETE');
  try {
    const { id } = req.params;
    const memory = stmtSelectMemoryById.get(id);
    console.log('Memory to delete:', memory);
    if (!memory) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }

    stmtDeleteMemoryById.run(id);

    let details = memory.title;
    if (memory.date || memory.time) {
      const dateTimeParts = [];
      if (memory.date) dateTimeParts.push(`on ${memory.date}`);
      if (memory.time) dateTimeParts.push(`at ${memory.time}`);
      details += ` ${dateTimeParts.join(' ')}`;
    }

    const infoMessageText = `Memory deleted: ${details.trim()}`;
    console.log('Info message to send:', infoMessageText);

    res.json({
      type: "info",
      action: "memory_deleted",
      memory: memory,
      message: infoMessageText
    });

  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /memory/:id
 * Fetches a single memory by ID.
 */
router.get('/memory/:id', async (req, res) => {
  console.log('Recieved request at /memory/:id GET');
  try {
    const { id } = req.params;
    const memory = stmtSelectMemoryById.get(id);
    if (!memory) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }
    res.json({ memory });

  } catch (error) {
    console.error('Error fetching memory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /memory/:id
 * Updates details of a specific memory by ID.
 */
router.patch('/memory/:id', async (req, res) => {
  console.log('Recieved request at /memory/:id PATCH');
  try {
    const { id } = req.params;
    const { type, title, content, date, time } = req.body;

    const oldMemory = stmtSelectMemoryById.get(id);
    if (!oldMemory) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }

    stmtUpdateMemoryById.run(type, title, content, date, time, id);

    const updatedMemory = stmtSelectMemoryById.get(id);

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

  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
