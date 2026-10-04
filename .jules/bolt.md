# Bolt's Journal - Critical Learnings

## 2026-10-04 - Cache Intl.DateTimeFormat and Avoid Date Allocations in Loops
**Learning:** Instantiating `new Intl.DateTimeFormat` on every request incurs high ICU initialization overhead (~13x slower). Additionally, creating `new Date()` instances inside loops over database memories for date comparison creates heavy GC pressure; comparing ISO date strings (`YYYY-MM-DD`) directly avoids Date allocations and speeds up categorization by ~4.5x.
**Action:** Cache `Intl.DateTimeFormat` instances in a Map by timeZone, and pre-compute `tomorrowDate` so memory time categorization can use direct ISO string equality checks instead of allocating `Date` objects inside loops.

## 2026-09-30 - SQLite Expression Columns Bypass Indexes
**Learning:** In SQLite/better-sqlite3, queries using string concatenation expressions in `WHERE` clauses (e.g. `(date || ' ' || time) >= ?`) bypass standard table indexes on `date` and `time`, forcing full table scans (`SCAN memories`). Adding explicit column filtering `date >= ? AND date <= ?` alongside the expression allows SQLite to perform an index search (`SEARCH memories USING INDEX`) first.
**Action:** When filtering dates or times in SQLite, always include explicit column comparisons (`date >= ?`) before or alongside computed expression clauses so SQLite can use index range scans.
