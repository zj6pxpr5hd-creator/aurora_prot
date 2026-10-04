import { memo } from 'react';
import type { UpcomingEventItem, GoalItem } from '../types/memory';

interface RightColumnSectionsProps {
  upComingEvents: UpcomingEventItem[];
  isUpcomingLoading: boolean;
  upcomingError: string;
  goals: GoalItem[];
  isGoalsLoading: boolean;
  goalsError: string;
}

/**
 * Renders the right sidebar column containing Upcoming Events and Goals sections.
 * Performance Optimization: Wrapped with React.memo to prevent unnecessary re-renders
 * during unrelated parent component state updates (such as input text composer updates).
 *
 * @param upComingEvents List of upcoming event memory items.
 * @param isUpcomingLoading Loading status for upcoming events.
 * @param upcomingError Error string for upcoming events fetch.
 * @param goals List of user goal memory items.
 * @param isGoalsLoading Loading status for goals.
 * @param goalsError Error string for goals fetch.
 */
export const RightColumnSections = memo(function RightColumnSections({
  upComingEvents,
  isUpcomingLoading,
  upcomingError,
  goals,
  isGoalsLoading,
  goalsError,
}: RightColumnSectionsProps) {
  return (
    <div className="right-column">
      <aside className="upcoming-events" aria-labelledby="upcoming-events-title">
        <div className="upcoming-events-heading">
          <div>
            <p className="eyebrow">Upcoming</p>
            <h2 id="upcoming-events-title">Upcoming Events</h2>
          </div>
        </div>

        {upcomingError ? (
          <div className="section-error" role="alert">
            <p>{upcomingError}</p>
          </div>
        ) : isUpcomingLoading ? (
          <ul className="upcoming-events-list upcoming-events-skeleton" aria-label="Loading upcoming events">
            <li className="upcoming-events-skeleton-item">
              <span />
              <span />
              <span />
            </li>
            <li className="upcoming-events-skeleton-item">
              <span />
              <span />
              <span />
            </li>
          </ul>
        ) : upComingEvents.length > 0 ? (
          <ul className="upcoming-events-list">
            {upComingEvents.map((memory, index) => (
              <li className="upcoming-events-item" key={`${memory.type}-${memory.title}-${index}`}>
                <strong>{memory.title}</strong>
                <div className="upcoming-events-meta">
                  <span>{memory.time ?? 'No time'}</span>
                  <span>{memory.type}</span>
                </div>
                <p>{memory.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="upcoming-events-empty">Nothing to do right now.</p>
        )}
      </aside>

      <aside className="goals" aria-labelledby="goals-title">
        <div className="goals-heading">
          <div>
            <p className="eyebrow">Goals</p>
            <h2 id="goals-title">Stay Focus!</h2>
          </div>
        </div>

        {goalsError ? (
          <div className="section-error" role="alert">
            <p>{goalsError}</p>
          </div>
        ) : isGoalsLoading ? (
          <ul className="goals-list goals-skeleton" aria-label="Loading Goals">
            <li className="goals-skeleton-item">
              <span />
              <span />
              <span />
            </li>
            <li className="goals-skeleton-item">
              <span />
              <span />
              <span />
            </li>
          </ul>
        ) : goals.length > 0 ? (
          <ul className="goals-list">
            {goals.map((memory, index) => (
              <li className="goals-item" key={`${memory.title}-${index}`}>
                <strong>{memory.title}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="goals-empty">Nothing to do right now.</p>
        )}
      </aside>
    </div>
  );
});
