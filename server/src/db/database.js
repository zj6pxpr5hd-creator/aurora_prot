import Database from "better-sqlite3";
import path from "path";
import fs from "fs"; // Added to handle directory creation
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_FILE || path.join(__dirname, "aurora.db");

// 2. Ensure the parent directory exists before opening the database
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

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

const count = db.prepare("SELECT COUNT(*) as count FROM memories").get().count;
if (count === 0) {
  db.prepare(`
    INSERT INTO memories (type, title, content, date, time)
    VALUES (?, ?, ?, ?, ?)
  `).run('personal', 'Favourite morning ritual', 'A quiet coffee and ten minutes of reading helps start the day well.', '2026-09-18', '08:00');
}

export default db;
