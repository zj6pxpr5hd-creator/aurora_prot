import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "aurora.db");

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT,
    time TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  /* Performance Optimizations: Database Indexes
   * - idx_memories_date_time: Enables index lookup (O(log N)) for queries filtering by date/time (today/upcoming)
   * - idx_memories_type: Enables fast lookup (O(log N)) when retrieving goals, tasks, or events
   * - idx_memories_created_at: Avoids temp B-tree sorting when ordering memories by creation time
   */
  CREATE INDEX IF NOT EXISTS idx_memories_date_time ON memories(date, time);
  CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
  CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);
`);

export default db;