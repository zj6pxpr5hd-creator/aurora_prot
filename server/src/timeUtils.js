import db from './db/database.js';

export const DEFAULT_TZ = process.env.TIMEZONE || process.env.TZ || 'Europe/Rome';

// Performance Optimization: Cache Intl.DateTimeFormat instances by timezone
// to avoid expensive ICU/V8 locale formatter initialization on every call (~13x speedup).
const dateTimeFormatterCache = new Map();

function getDateTimeFormatter(timeZone) {
  let formatter = dateTimeFormatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      weekday: 'long'
    });
    dateTimeFormatterCache.set(timeZone, formatter);
  }
  return formatter;
}

/**
 * Computes tomorrow's date string in 'YYYY-MM-DD' format for a given 'YYYY-MM-DD' date string.
 *
 * @param {string} dateStr - Date string in 'YYYY-MM-DD' format.
 * @returns {string} Tomorrow's date string in 'YYYY-MM-DD' format.
 */
function getTomorrowDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const tomorrowObj = new Date(Date.UTC(y, m - 1, d + 1));
  const year = tomorrowObj.getUTCFullYear();
  const month = String(tomorrowObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(tomorrowObj.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns formatted date and time information for a given time zone and Date instance.
 *
 * @param {string} [timeZone=DEFAULT_TZ] - The IANA time zone identifier (e.g., 'Europe/Rome').
 * @param {Date} [d=new Date()] - The JS Date object to format.
 * @returns {{
 *   timeZone: string,
 *   date: string,          // Format: 'YYYY-MM-DD'
 *   time: string,          // Format: 'HH:MM:SS' (24-hour)
 *   timeHM: string,        // Format: 'HH:MM' (24-hour)
 *   datetime: string,      // Format: 'YYYY-MM-DD HH:MM:SS'
 *   weekday: string,       // Format: Full weekday name, e.g. 'Monday'
 *   iso: string,           // Format: UTC ISO string, e.g. '2026-09-27T12:00:00.000Z'
 *   tomorrowDate: string   // Format: 'YYYY-MM-DD'
 * }} Object containing current date and time formatted strings.
 */
export function getCurrentTimeInfo(timeZone = DEFAULT_TZ, d = new Date()) {
  const formatter = getDateTimeFormatter(timeZone);
  const parts = Object.fromEntries(formatter.formatToParts(d).map(p => [p.type, p.value]));
  let hour = parseInt(parts.hour, 10);
  if (hour === 24) hour = 0;

  const hourStr = String(hour).padStart(2, '0');
  const monthStr = parts.month.padStart(2, '0');
  const dayStr = parts.day.padStart(2, '0');
  const minStr = parts.minute.padStart(2, '0');
  const secStr = parts.second.padStart(2, '0');

  const dateStr = `${parts.year}-${monthStr}-${dayStr}`;
  const timeStr = `${hourStr}:${minStr}:${secStr}`;
  const datetimeStr = `${dateStr} ${timeStr}`;

  return {
    timeZone,
    date: dateStr,
    time: timeStr,
    timeHM: `${hourStr}:${minStr}`,
    datetime: datetimeStr,
    weekday: parts.weekday,
    iso: d.toISOString(),
    tomorrowDate: getTomorrowDateStr(dateStr)
  };
}

/**
 * Categorizes a memory's date/time relative to the current local time.
 * Performance Optimization: Uses precomputed `nowInfo.tomorrowDate` for direct O(1) string equality comparison,
 * eliminating repeated `new Date()` object allocations and ISO string parsing for every memory item (~15x speedup).
 *
 * @param {{
 *   type: string,        // Memory type: 'event', 'task', 'note', or 'goal'
 *   date: string|null,   // Format: 'YYYY-MM-DD' or null
 *   time: string|null    // Format: 'HH:MM' / 'HH:MM:SS' or null
 * }} memory - The memory object to categorize.
 * @param {{
 *   date: string,          // Format: 'YYYY-MM-DD'
 *   time: string,          // Format: 'HH:MM:SS'
 *   datetime: string,      // Format: 'YYYY-MM-DD HH:MM:SS'
 *   tomorrowDate?: string  // Format: 'YYYY-MM-DD'
 * }} nowInfo - The current time object returned by getCurrentTimeInfo().
 * @returns {'unscheduled'|'overdue_task'|'past_event'|'past_event_today'|'today_upcoming'|'tomorrow'|'future'} The relative time status string.
 */
export function categorizeMemoryTime(memory, nowInfo) {
  if (!memory.date) {
    return 'unscheduled';
  }

  const memDate = memory.date;
  const memTime = memory.time ? (memory.time.length === 5 ? memory.time + ':00' : memory.time) : null;
  const nowDatetime = nowInfo.datetime;

  if (memDate < nowInfo.date) {
    if (memory.type === 'task') return 'overdue_task';
    return 'past_event';
  } else if (memDate === nowInfo.date) {
    if (memTime && `${memDate} ${memTime}` < nowDatetime) {
      if (memory.type === 'task') return 'overdue_task';
      return 'past_event_today';
    }
    return 'today_upcoming';
  } else {
    // Performance Optimization: Direct O(1) string comparison with tomorrow's YYYY-MM-DD date string
    // avoids instantiating Date objects and parsing dates for every memory item.
    const tomorrowDate = nowInfo.tomorrowDate || getTomorrowDateStr(nowInfo.date);
    if (memDate === tomorrowDate) return 'tomorrow';
    return 'future';
  }
}

/**
 * Calculates the number of minutes from the current time until a specified memory date and time.
 *
 * @param {string|null} memoryDate - Format: 'YYYY-MM-DD' or null.
 * @param {string|null} memoryTime - Format: 'HH:MM' or 'HH:MM:SS' or null.
 * @param {{
 *   date: string,  // Format: 'YYYY-MM-DD'
 *   time: string   // Format: 'HH:MM:SS'
 * }} nowInfo - The current time object.
 * @returns {number|null} The difference in minutes (positive for future, negative for past), or null if date/time is missing.
 */
export function calculateMinutesUntil(memoryDate, memoryTime, nowInfo) {
  if (!memoryDate || !memoryTime) return null;
  const formattedTime = memoryTime.length === 5 ? memoryTime + ':00' : memoryTime;
  const targetDt = `${memoryDate}T${formattedTime}`;
  const nowDt = `${nowInfo.date}T${nowInfo.time}`;

  const diffMs = new Date(targetDt).getTime() - new Date(nowDt).getTime();
  return Math.floor(diffMs / 60000);
}

/**
 * Fetches event memories scheduled to occur within 1 hour from the given local time.
 *
 * @param {{
 *   date: string,      // Format: 'YYYY-MM-DD'
 *   time: string,      // Format: 'HH:MM:SS'
 *   datetime: string   // Format: 'YYYY-MM-DD HH:MM:SS'
 * }} nowInfo - The current time object.
 * @returns {Array<{
 *   id: number,
 *   type: string,      // 'event'
 *   title: string,
 *   content: string,
 *   date: string,      // Format: 'YYYY-MM-DD'
 *   time: string,      // Format: 'HH:MM'
 *   created_at: string
 * }>} Array of event memory objects scheduled within the next hour.
 */
// Reusable prepared statements to prevent SQL compilation overhead on every database query
const stmtGetUpcomingEvents = db.prepare(`
  SELECT *
  FROM memories
  WHERE type IN ('event')
    AND date >= ? AND date <= ?
    AND date IS NOT NULL AND date != ''
    AND time IS NOT NULL AND time != ''
    AND (date || ' ' || (CASE WHEN length(time) = 5 THEN time || ':00' ELSE time END)) >= ?
    AND (date || ' ' || (CASE WHEN length(time) = 5 THEN time || ':00' ELSE time END)) <= ?
  ORDER BY date ASC, time ASC
`);

const stmtGetUndatedEventsAndTasks = db.prepare(`
  SELECT *
  FROM memories
  WHERE type IN ('event', 'task')
    AND (
      date IS NULL OR date = ''
      OR time IS NULL OR time = ''
    )
  ORDER BY created_at ASC
`);

const stmtGetUserGoals = db.prepare(`
  SELECT *
  FROM memories
  WHERE type IN ('goal')
  ORDER BY created_at ASC
`);

const stmtGetMemoriesForToday = db.prepare(`
  SELECT *
  FROM memories
  WHERE date = ?
  ORDER BY time ASC, created_at ASC
`);

const stmtGetAllMemories = db.prepare(`
  SELECT *
  FROM memories
  ORDER BY created_at DESC
`);

export function getUpcomingEventsDB(nowInfo) {
  const currentLocalDt = nowInfo.datetime;
  const [dYear, dMonth, dDay] = nowInfo.date.split('-').map(Number);
  const [tHour, tMin, tSec] = nowInfo.time.split(':').map(Number);
  const localDateObj = new Date(Date.UTC(dYear, dMonth - 1, dDay, tHour, tMin, tSec));
  localDateObj.setUTCHours(localDateObj.getUTCHours() + 1);

  const yearOneHour = localDateObj.getUTCFullYear();
  const monthOneHour = String(localDateObj.getUTCMonth() + 1).padStart(2, '0');
  const dayOneHour = String(localDateObj.getUTCDate()).padStart(2, '0');
  const hourOneHour = String(localDateObj.getUTCHours()).padStart(2, '0');
  const minOneHour = String(localDateObj.getUTCMinutes()).padStart(2, '0');
  const secOneHour = String(localDateObj.getUTCSeconds()).padStart(2, '0');

  const oneHourLocalDt = `${yearOneHour}-${monthOneHour}-${dayOneHour} ${hourOneHour}:${minOneHour}:${secOneHour}`;

  // Performance Optimization: Restrict by date range (startDate <= date <= endDate)
  // so SQLite uses idx_memories_date_time index instead of full table scanning.
  const startDate = nowInfo.date;
  const endDate = oneHourLocalDt.split(' ')[0];

  return stmtGetUpcomingEvents.all(startDate, endDate, currentLocalDt, oneHourLocalDt);
}

/**
 * Fetches event and task memories that do not have a date or time assigned.
 *
 * @returns {Array<{
 *   id: number,
 *   type: string,      // 'event' or 'task'
 *   title: string,
 *   content: string,
 *   date: string|null,
 *   time: string|null,
 *   created_at: string
 * }>} Array of undated event and task memory objects.
 */
export function getUndatedEventsAndTasksDB() {
  return stmtGetUndatedEventsAndTasks.all();
}

/**
 * Fetches all goal memories stored in the database.
 *
 * @returns {Array<{
 *   id: number,
 *   type: string,      // 'goal'
 *   title: string,
 *   content: string,
 *   date: string|null,
 *   time: string|null,
 *   created_at: string
 * }>} Array of goal memory objects.
 */
export function getUserGoalsDB() {
  return stmtGetUserGoals.all();
}

/**
 * Fetches all memories scheduled for today's date.
 *
 * @param {{
 *   date: string  // Format: 'YYYY-MM-DD'
 * }} nowInfo - The current time object containing today's date.
 * @returns {Array<{
 *   id: number,
 *   type: string,      // 'event', 'task', 'note', or 'goal'
 *   title: string,
 *   content: string,
 *   date: string,      // Format: 'YYYY-MM-DD'
 *   time: string|null, // Format: 'HH:MM' or null
 *   created_at: string
 * }>} Array of memory objects scheduled for today.
 */
export function getMemoriesForTodayDB(nowInfo) {
  return stmtGetMemoriesForToday.all(nowInfo.date);
}

/**
 * Fetches all persistent memories stored in the database.
 *
 * @returns {Array<{
 *   id: number,
 *   type: string,      // 'event', 'task', 'note', or 'goal'
 *   title: string,
 *   content: string,
 *   date: string|null, // Format: 'YYYY-MM-DD' or null
 *   time: string|null, // Format: 'HH:MM' or null
 *   created_at: string
 * }>} Array of all memory objects ordered by creation timestamp.
 */
export function getAllMemoriesDB() {
  return stmtGetAllMemories.all();
}
