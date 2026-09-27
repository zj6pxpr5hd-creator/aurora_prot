import db from './db/database.js';

export const DEFAULT_TZ = process.env.TIMEZONE || process.env.TZ || 'Europe/Rome';

export function getCurrentTimeInfo(timeZone = DEFAULT_TZ, d = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
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
    iso: d.toISOString()
  };
}

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
    const d1 = new Date(nowInfo.date + 'T00:00:00Z').getTime();
    const d2 = new Date(memDate + 'T00:00:00Z').getTime();
    const diffDays = Math.round((d2 - d1) / (1000 * 3600 * 24));
    if (diffDays === 1) return 'tomorrow';
    return 'future';
  }
}

export function calculateMinutesUntil(memoryDate, memoryTime, nowInfo) {
  if (!memoryDate || !memoryTime) return null;
  const formattedTime = memoryTime.length === 5 ? memoryTime + ':00' : memoryTime;
  const targetDt = `${memoryDate}T${formattedTime}`;
  const nowDt = `${nowInfo.date}T${nowInfo.time}`;

  const diffMs = new Date(targetDt).getTime() - new Date(nowDt).getTime();
  return Math.floor(diffMs / 60000);
}

export function getUpcomingEventsDB(nowInfo) {
  // Return events occurring between current time and 1 hour from now in local time
  const currentLocalDt = nowInfo.datetime;
  // Calculate +1 hour in local time context
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

  const memories = db.prepare(`
    SELECT *
    FROM memories
    WHERE type IN ('event')
      AND date IS NOT NULL AND date != ''
      AND time IS NOT NULL AND time != ''
      AND (date || ' ' || (CASE WHEN length(time) = 5 THEN time || ':00' ELSE time END)) >= ?
      AND (date || ' ' || (CASE WHEN length(time) = 5 THEN time || ':00' ELSE time END)) <= ?
    ORDER BY date ASC, time ASC
  `).all(currentLocalDt, oneHourLocalDt);

  return memories;
}

export function getUndatedEventsAndTasksDB() {
  const memories = db.prepare(`
    SELECT *
    FROM memories
    WHERE type IN ('event', 'task')
      AND (
        date IS NULL OR date = ''
        OR time IS NULL OR time = ''
      )
    ORDER BY created_at ASC
  `).all();
  return memories;
}

export function getUserGoalsDB() {
  const goals = db.prepare(`
    SELECT *
    FROM memories
    WHERE type IN ('goal')
    ORDER BY created_at ASC
  `).all();
  return goals;
}

export function getMemoriesForTodayDB(nowInfo) {
  const memories = db.prepare(`
    SELECT *
    FROM memories
    WHERE date = ?
    ORDER BY time ASC, created_at ASC
  `).all(nowInfo.date);
  return memories;
}

export function getAllMemoriesDB() {
  const memories = db.prepare(`
    SELECT *
    FROM memories
    ORDER BY created_at ASC
  `).all();
  return memories;
}
