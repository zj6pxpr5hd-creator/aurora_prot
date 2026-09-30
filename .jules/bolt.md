# Bolt's Journal - Critical Learnings

## 2026-09-30 - SQLite Expression Columns Bypass Indexes
**Learning:** In SQLite/better-sqlite3, queries using string concatenation expressions in `WHERE` clauses (e.g. `(date || ' ' || time) >= ?`) bypass standard table indexes on `date` and `time`, forcing full table scans (`SCAN memories`). Adding explicit column filtering `date >= ? AND date <= ?` alongside the expression allows SQLite to perform an index search (`SEARCH memories USING INDEX`) first.
**Action:** When filtering dates or times in SQLite, always include explicit column comparisons (`date >= ?`) before or alongside computed expression clauses so SQLite can use index range scans.
