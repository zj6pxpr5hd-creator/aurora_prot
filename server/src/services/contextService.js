import {
  getCurrentTimeInfo,
  categorizeMemoryTime,
  calculateMinutesUntil,
  getUpcomingEventsDB,
  getUndatedEventsAndTasksDB,
  getUserGoalsDB,
  getAllMemoriesDB
} from '../timeUtils.js';

/**
 * Builds the comprehensive current context payload for Aurora, including current date/time,
 * active persistent memories with time statuses, upcoming events, undated items, and user goals.
 *
 * @returns {Promise<{
 *   currentTime: {
 *     timeZone: string,
 *     date: string,      // Format: 'YYYY-MM-DD'
 *     time: string,      // Format: 'HH:MM'
 *     datetime: string,  // Format: 'YYYY-MM-DD HH:MM:SS'
 *     weekday: string    // e.g. 'Monday'
 *   },
 *   persistentMemories: Array<{
 *     id: number,
 *     type: string,      // 'event', 'task', 'note', or 'goal'
 *     title: string,
 *     content: string,
 *     date: string|null, // Format: 'YYYY-MM-DD' or null
 *     time: string|null, // Format: 'HH:MM' or null
 *     timeStatus: string // 'unscheduled', 'overdue_task', 'past_event', 'past_event_today', 'today_upcoming', 'tomorrow', 'future'
 *   }>,
 *   upcomingEventsNextHour: Array<object>,
 *   nextEvent: object|null,
 *   unscheduledItems: Array<object>,
 *   goals: Array<object>
 * }>} Object containing complete structured context.
 */
export async function createContext() {
  const nowInfo = getCurrentTimeInfo();
  let upcoming = [];
  let undated = [];
  let goals = [];
  let allMemories = [];

  try {
    upcoming = getUpcomingEventsDB(nowInfo);
    undated = getUndatedEventsAndTasksDB();
    goals = getUserGoalsDB();
    allMemories = getAllMemoriesDB();
  } catch (error) {
    console.error('Error fetching memories for context: ', error);
    throw error;
  }

  let nextEvent = upcoming.length > 0 ? upcoming[0] : null;
  if (nextEvent) {
    nextEvent = {
      ...nextEvent,
      minutesUntil: calculateMinutesUntil(nextEvent.date, nextEvent.time, nowInfo)
    };
  }

  const persistentMemories = allMemories.map(mem => ({
    id: mem.id,
    type: mem.type,
    title: mem.title,
    content: mem.content,
    date: mem.date,
    time: mem.time,
    timeStatus: categorizeMemoryTime(mem, nowInfo, nowInfo.tomorrowDate)
  }));

  return {
    currentTime: {
      timeZone: nowInfo.timeZone,
      date: nowInfo.date,
      time: nowInfo.timeHM,
      datetime: nowInfo.datetime,
      weekday: nowInfo.weekday
    },
    persistentMemories: persistentMemories,
    upcomingEventsNextHour: upcoming,
    nextEvent: nextEvent,
    unscheduledItems: undated,
    goals: goals,
  };
}

/**
 * Wraps createContext result into a context container object.
 *
 * @returns {Promise<{
 *   context: object
 * }>} Object containing context data.
 */
export async function createFullContext() {
  const context = await createContext();
  return {
    context: context,
  };
}

/**
 * Fetches user goals from database.
 *
 * @returns {Promise<Array<{
 *   id: number,
 *   type: string,      // 'goal'
 *   title: string,
 *   content: string,
 *   date: string|null,
 *   time: string|null,
 *   created_at: string
 * }>>} Array of user goal objects.
 */
export async function getUserGoals() {
  return getUserGoalsDB();
}
