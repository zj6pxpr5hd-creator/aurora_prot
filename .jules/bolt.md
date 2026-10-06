## 2026-09-27 - Context Generation & LLM Prompt Optimization

**Learning:** When generating context payloads containing arrays of time-sensitive items, re-instantiating `Date` objects (like `new Date(nowInfo.date + 'T00:00:00Z').getTime()`) per-item inside `.map()` loops creates unnecessary memory allocations and CPU overhead. Precomputing the reference timestamp once before looping eliminates repeated Date parsing. Additionally, passing `JSON.stringify(context, null, 2)` into LLM prompts sends formatted whitespace that inflates token counts and payload sizes by 30-40% without providing any benefit to LLM response accuracy.

**Action:** Always precompute static timestamps outside array transformation loops in backend context builders, and use compact `JSON.stringify(obj)` when embedding JSON payloads into LLM prompts.
