## 2026-10-06 - Cache `Intl.DateTimeFormat` instances in Node.js server time utilities
**Learning:** `new Intl.DateTimeFormat()` instantiation in Node.js has high CPU overhead due to V8 ICU/locale resolution. In backend request handlers that run time calculations frequently, instantiating `Intl.DateTimeFormat` on every invocation slows date formatting down by ~8.5x.
**Action:** Always cache `Intl.DateTimeFormat` instances by timezone key in backend utility modules when formatting dates repeatedly.
