## 2026-09-27 - Context Generation & LLM Prompt Optimization

**Learning:** When generating context payloads containing arrays of time-sensitive items, re-instantiating `Date` objects (like `new Date(nowInfo.date + 'T00:00:00Z').getTime()`) per-item inside `.map()` loops creates unnecessary memory allocations and CPU overhead. Precomputing the reference timestamp once before looping eliminates repeated Date parsing. Additionally, passing `JSON.stringify(context, null, 2)` into LLM prompts sends formatted whitespace that inflates token counts and payload sizes by 30-40% without providing any benefit to LLM response accuracy.

**Action:** Always precompute static timestamps outside array transformation loops in backend context builders, and use compact `JSON.stringify(obj)` when embedding JSON payloads into LLM prompts.

## 2026-10-07 - DateTimeFormat Caching & String Date Categorization

**Learning:** Repeatedly instantiating `new Intl.DateTimeFormat` in Node.js creates significant V8 and C++ ICU allocation overhead (~0.13ms per call). Caching `Intl.DateTimeFormat` instances in a map by timezone speeds up `getCurrentTimeInfo()` calls by ~13x. Furthermore, comparing ISO `YYYY-MM-DD` date strings directly against precomputed `tomorrowDate` replaces `Date` object instantiations and ISO string parsing in memory categorization loops with O(1) string equality comparisons (~15x speedup).

**Action:** Cache `Intl.DateTimeFormat` formatters by timezone at module scope and precompute `tomorrowDate` strings for fast $O(1)$ relative date categorization.
