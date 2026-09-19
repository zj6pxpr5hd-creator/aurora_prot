
import  {useState, useEffect} from 'react'
import './App.css';

const fetchDailyBreakdown = async (signal?: AbortSignal) => {
  const response = await fetch('http://localhost:3000/memory/today', { signal });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.memories;
};

const fetchGoals = async (signal?: AbortSignal) => {
  const response = await fetch('http://localhost:3000/goals', { signal });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.goals;
};

function App() {  
  const [value, setValue] = useState('');
  const [error, setError] = useState("");
  const [dailyBreakdown, setDailyBreakdown] = useState<Array<{type: "event" | "task" | "note" | "idea"; title: string; content: string; date: string | null; time: string | null}>>([]);
  const [isDailyBreakdownLoading, setIsDailyBreakdownLoading] = useState(true);
  const [dailyBreakdownError, setDailyBreakdownError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [upComingEvents, setUpComingEvents] = useState<Array<{type: "event" | "task" | "note" ; title: string; content: string; date: string | null; time: string | null}>>([]);
  const [upComingEventsError, setUpComingEventsError] = useState("");
  const [isUpComingEventsLoading, setUpComingEventsLoading] = useState(true);
  const [AuroraResponse, setAuroraResponse] = useState('');
  const [goals, setGoals] = useState<Array<{title: string; content: string; date: string | null; time: string | null}>>([]);
  const [goalsError, setGoalsError] = useState("");
  const [isGoalsLoading, setIsGoalsLoading] = useState(true);
  const [messages, setMessages] = useState<Array<{role: "user" | "assistant"; content: string}>>([]);





  const createMemory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!value.trim()) {
      setError("Please enter some text.");
      return;
    }

    setError("");
    setIsSaving(true);

    const updatedMessages = [
      ...messages,
      { role: "user" as const, content: value }
    ];

    setMessages(updatedMessages);

    localStorage.setItem('messages', JSON.stringify(updatedMessages));

    try {
      const response = await fetch('http://localhost:3000/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: value, messages: updatedMessages.slice(-10) }), // Send only the last 10 messages to the server
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const AuroraResponse = data.AuroraResponse;
      setAuroraResponse(AuroraResponse);
      setMessages(prevMessages => [...prevMessages, { role: "assistant", content: AuroraResponse }]);
    } catch (error) {
      console.error('Error creating memory: ', error);
      setError('Failed to create memory, Please try again later.');
    }
    finally {
      setValue('');
      setIsSaving(false);
    }

  };

  const retryDailyBreakdown = async () => {
    setIsDailyBreakdownLoading(true);
    setDailyBreakdownError("");

    try {
      const memories = await fetchDailyBreakdown();
      setDailyBreakdown(memories);
    } catch (error) {
      console.error('Error retrying daily breakdown:', error);
      setDailyBreakdownError('Could not load today\'s breakdown.');
    } finally {
      setIsDailyBreakdownLoading(false);
    }
  };

  useEffect(() => {
    const fetchDueEvents = async () => {
      try {
        const response = await fetch("http://localhost:3000/memory/upcoming");

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        setUpComingEvents(data.upcoming);
      } catch (error) {
        console.error("Error fetching due events:", error);
        setUpComingEventsError("Could not load upcoming events");
      }
      setUpComingEventsLoading(false);
    };

    fetchDueEvents();

    const interval = setInterval(fetchDueEvents, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadDailyBreakdown = async () => {
      try {
        const memories = await fetchDailyBreakdown(controller.signal);

        if (!controller.signal.aborted) {
          console.log('Daily breakdown:', memories);
          setDailyBreakdown(memories);
          setDailyBreakdownError("");
          setIsDailyBreakdownLoading(false);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error loading daily breakdown:', error);
          setDailyBreakdownError('Could not load today\'s breakdown.');
          setIsDailyBreakdownLoading(false);
        }
      }
    };

    const loadGoals = async () => {
      try {
        const goals = await fetchGoals();
        if (!controller.signal.aborted) {
          setGoals(goals);
          setGoalsError("");
          setIsGoalsLoading(false);
        }

      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error loading goals:', error);
          setGoalsError('Could not load goals.');
          setIsGoalsLoading(false);
        }
      }
    };

    const loadStoredMessages = () => {
      const storedMessages = localStorage.getItem('messages');
      if (!storedMessages) {
        return;
      }
      setMessages(JSON.parse(storedMessages) || []);
    }


    void loadDailyBreakdown();
    void loadGoals();
    void loadStoredMessages();

    return () => {
      controller.abort();
    };
  }, []);

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return(
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">A</div>
        <div>
          <p className="eyebrow">Personal memory assistant</p>
          <h1>Aurora</h1>
        </div>
        <span className="status-dot">Ready</span>
      </header>

      <div className="app-layout">
        <aside className="daily-breakdown" aria-labelledby="daily-breakdown-title">
          <div className="daily-breakdown-heading">
            <div>
              <p className="eyebrow">Your day</p>
              <h2 id="daily-breakdown-title">Daily Breakdown</h2>
            </div>
            <time dateTime={new Date().toISOString().split('T')[0]}>{formattedDate}</time>
          </div>

          {dailyBreakdownError ? (
            <div className="section-error" role="alert">
              <p>{dailyBreakdownError}</p>
              <button type="button" className="retry-button" onClick={retryDailyBreakdown}>Try again</button>
            </div>
          ) : isDailyBreakdownLoading ? (
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

        <div className="right-column">
          <aside className="upcoming-events" aria-labelledby="upcoming-events-title">
            <div className="upcoming-events-heading">
              <div>
                <p className="eyebrow">Upcoming</p>
                <h2 id="upcoming-events-title">Upcoming Events</h2>
              </div>
            </div>

            {upComingEventsError ? (
              <div className="section-error" role="alert">
                <p>{upComingEventsError}</p>
              </div>
            ) : isUpComingEventsLoading ? (
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



        <div className="main-content">
          <section className="conversation" aria-live="polite">
            {AuroraResponse ? (
              <p className="aurora-response-bubble">{AuroraResponse}</p>
            ) : (
              <div className="conversation-empty">
                <p className="eyebrow">A clear place to begin</p>
                <h2>Tell Aurora what you want to remember.</h2>
              </div>
            )}
          </section>

          <div className="composer-wrap">
            <form className="composer" onSubmit={createMemory}>
              <input aria-label="Message Aurora" type="text" placeholder="e.g. Call Mum tomorrow at 6pm" value={value} onChange={(e) => setValue(e.target.value)} disabled={isSaving}/>
              <button type="submit" aria-label="Send message" disabled={isSaving}>{isSaving ? 'Saving...' : 'Send'} {!isSaving && <span aria-hidden="true">&#8594;</span>}</button>
            </form>
            {error && <p>{error}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;