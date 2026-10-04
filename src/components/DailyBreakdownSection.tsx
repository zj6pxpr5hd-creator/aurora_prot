import { memo } from 'react';
import type { DailyBreakdownItem } from '../types/memory';

interface DailyBreakdownSectionProps {
  dailyBreakdown: DailyBreakdownItem[];
  isLoading: boolean;
  error: string;
  formattedDate: string;
  onRetry: () => void;
}

/**
 * Renders the daily breakdown sidebar panel.
 * Performance Optimization: Wrapped with React.memo to skip re-renders when parent App state
 * (such as composer input text value) changes, preserving DOM stability for static schedule items.
 *
 * @param dailyBreakdown Array of memories scheduled for today.
 * @param isLoading Loading indicator status.
 * @param error Error message string if fetch failed.
 * @param formattedDate Human readable formatted date string.
 * @param onRetry Callback handler to retry fetching today's breakdown.
 */
export const DailyBreakdownSection = memo(function DailyBreakdownSection({
  dailyBreakdown,
  isLoading,
  error,
  formattedDate,
  onRetry,
}: DailyBreakdownSectionProps) {
  return (
    <aside className="daily-breakdown" aria-labelledby="daily-breakdown-title">
      <div className="daily-breakdown-heading">
        <div>
          <p className="eyebrow">Your day</p>
          <h2 id="daily-breakdown-title">Daily Breakdown</h2>
        </div>
        <time dateTime={new Date().toISOString().split('T')[0]}>{formattedDate}</time>
      </div>

      {error ? (
        <div className="section-error" role="alert">
          <p>{error}</p>
          <button type="button" className="retry-button" onClick={onRetry}>Try again</button>
        </div>
      ) : isLoading ? (
        <ul className="daily-breakdown-list daily-breakdown-skeleton" aria-label="Loading daily breakdown">
          <li className="daily-breakdown-skeleton-item">
            <span />
            <span />
            <span />
          </li>
          <li className="daily-breakdown-skeleton-item">
            <span />
            <span />
            <span />
          </li>
        </ul>
      ) : dailyBreakdown.length > 0 ? (
        <ul className="daily-breakdown-list">
          {dailyBreakdown.map((memory, index) => (
            <li className="daily-breakdown-item" key={`${memory.type}-${memory.title}-${index}`}>
              <strong>{memory.title}</strong>
              <div className="daily-breakdown-meta">
                <span>{memory.time ?? 'No time'}</span>
                <span>{memory.type}</span>
              </div>
              <p>{memory.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="daily-breakdown-empty">Nothing planned for today.</p>
      )}
    </aside>
  );
});
