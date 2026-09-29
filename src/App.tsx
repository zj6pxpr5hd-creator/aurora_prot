import { useState, useEffect, useRef } from 'react';
import './App.css';
import type { Memory, ChatMessage, DailyBreakdownItem, UpcomingEventItem, GoalItem, RelevantMemory } from './types/memory';
import {
  fetchMemoriesApi,
  createMemoryApi,
  fetchDailyBreakdownApi,
  fetchGoalsApi,
  fetchUpcomingEventsApi,
  fetchRelevantMemoriesApi
} from './services/api';
import { Header } from './components/Header';
import { MemoryItem } from './components/MemoryItem';
import { MemoryEditor } from './components/MemoryEditor';
import { DailyBreakdownSection } from './components/DailyBreakdownSection';
import { RightColumnSections } from './components/RightColumnSections';
import { ConversationSection } from './components/ConversationSection';
import MemoryList from './EventList';

const initialMemories: Memory[] = [
  {
    id: 1,
    type: 'personal',
    title: 'Favourite morning ritual',
    content: 'A quiet coffee and ten minutes of reading helps start the day well.',
    date: '2026-09-18',
    time: '08:00',
  },
  {
    id: 2,
    type: 'preference',
    title: 'Keep plans gentle',
    content: 'Leave some breathing room between commitments when planning the week.',
  },
];

function App() {  
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [dailyBreakdown, setDailyBreakdown] = useState<DailyBreakdownItem[]>([]);
  const [isDailyBreakdownLoading, setIsDailyBreakdownLoading] = useState(true);
  const [dailyBreakdownError, setDailyBreakdownError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [upComingEvents, setUpComingEvents] = useState<UpcomingEventItem[]>([]);
  const [upComingEventsError, setUpComingEventsError] = useState('');
  const [isUpComingEventsLoading, setUpComingEventsLoading] = useState(true);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [goalsError, setGoalsError] = useState('');
  const [isGoalsLoading, setIsGoalsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [isMemoriesOpen, setIsMemoriesOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [relevantMemories, setRelevantMemories] = useState<RelevantMemory[]>([]);
  const [isRelevantMemoriesLoading, setIsRelevantMemoriesLoading] = useState(false);
  const [relevantMemoriesError, setRelevantMemoriesError] = useState('');
  const [isRelevantMemoriesOpen, setIsRelevantMemoriesOpen] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMemories = async (signal?: AbortSignal) => {
    try {
      const memoryList = await fetchMemoriesApi(signal);
      console.log('Fetch memories response:', memoryList);
      setMemories(memoryList);
    } catch (err) {
      console.error('Error fetching memories:', err);
    }
  };

  const createMemory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!value.trim()) {
      setError('Please enter some text.');
      return;
    }

    setError('');
    setIsSaving(true);

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: 'user' as const, content: value }
    ];

    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));

    try {
      const AuroraResponse = await createMemoryApi(value, updatedMessages);
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: AuroraResponse }]);
      localStorage.setItem('messages', JSON.stringify([...updatedMessages, { role: 'assistant', content: AuroraResponse }]));
    } catch (err) {
      console.error('Error creating memory: ', err);
      setError('Failed to create memory, Please try again later.');
    } finally {
      setValue('');
      setIsSaving(false);
    }
  };

  const retryDailyBreakdown = async () => {
    setIsDailyBreakdownLoading(true);
    setDailyBreakdownError('');

    try {
      const fetchedBreakdown = await fetchDailyBreakdownApi();
      setDailyBreakdown(fetchedBreakdown);
    } catch (err) {
      console.error('Error retrying daily breakdown:', err);
      setDailyBreakdownError('Could not load today\'s breakdown.');
    } finally {
      setIsDailyBreakdownLoading(false);
    }
  };

  useEffect(() => {
    const fetchDueEvents = async () => {
      try {
        const events = await fetchUpcomingEventsApi();
        setUpComingEvents(events);
      } catch (err) {
        console.error('Error fetching due events:', err);
        setUpComingEventsError('Could not load upcoming events');
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
      setIsDailyBreakdownLoading(true);
      try {
        const fetchedBreakdown = await fetchDailyBreakdownApi(controller.signal);

        if (!controller.signal.aborted) {
          console.log('Daily breakdown:', fetchedBreakdown);
          setDailyBreakdown(fetchedBreakdown);
          setDailyBreakdownError('');
          setIsDailyBreakdownLoading(false);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Error loading daily breakdown:', err);
          setDailyBreakdownError('Could not load today\'s breakdown.');
          setIsDailyBreakdownLoading(false);
        }
      }
    };

    const loadGoals = async () => {
      setIsGoalsLoading(true);
      try {
        const fetchedGoals = await fetchGoalsApi(controller.signal);
        if (!controller.signal.aborted) {
          setGoals(fetchedGoals);
          setGoalsError('');
          setIsGoalsLoading(false);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Error loading goals:', err);
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
    };

    void loadDailyBreakdown();
    void loadGoals();
    void loadStoredMessages();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadRelevantMemories = async () => {
      if (relevantMemories.length !== 0) {
        return;
      }

      fetchMemories();

      setIsRelevantMemoriesLoading(true);
      setRelevantMemoriesError('');

      try {
        const fetchedRelevant = await fetchRelevantMemoriesApi(messages, controller.signal);
        console.log('Relevant memories response:', fetchedRelevant);

        if (!controller.signal.aborted) {
          setRelevantMemories(fetchedRelevant);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Error loading relevant memories:', err);
          setRelevantMemoriesError('Could not load relevant memories.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsRelevantMemoriesLoading(false);
        }
      }
    };

    void loadRelevantMemories();

    return () => {
      controller.abort();
    };
  }, [messages, memories.length, relevantMemories.length]);

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <main className="app-shell">
      <Header
        isMemoriesOpen={isMemoriesOpen}
        isRelevantMemoriesOpen={isRelevantMemoriesOpen}
        onToggleMemories={() => {
          setIsRelevantMemoriesOpen(false);
          setIsMemoriesOpen((isOpen) => !isOpen);
          setEditingMemory(null);
          fetchMemories();
        }}
        onToggleRelevantMemories={() => {
          setIsMemoriesOpen(false);
          setIsRelevantMemoriesOpen((isOpen) => !isOpen);
        }}
      />

      <div className="app-layout">
        <div className="left-column">
          <DailyBreakdownSection
            dailyBreakdown={dailyBreakdown}
            isLoading={isDailyBreakdownLoading}
            error={dailyBreakdownError}
            formattedDate={formattedDate}
            onRetry={retryDailyBreakdown}
          />
        </div>

        <RightColumnSections
          upComingEvents={upComingEvents}
          isUpcomingLoading={isUpComingEventsLoading}
          upcomingError={upComingEventsError}
          goals={goals}
          isGoalsLoading={isGoalsLoading}
          goalsError={goalsError}
        />

        <div className="main-content">
          {isMemoriesOpen ? (
            <section className="memories-view" aria-labelledby="memories-title">
              <div className="memories-view-heading">
                <div>
                  <p className="eyebrow">Aurora memory</p>
                  <h2 id="memories-title">Your memories</h2>
                </div>
                <span className="memories-count">{memories.length} {memories.length === 1 ? 'memory' : 'memories'}</span>
              </div>

              {editingMemory ? (
                <MemoryEditor
                  memory={editingMemory}
                  onSave={(updatedMemory, infoMessage) => {
                    setMemories((current) => current.map((mem) => mem.id === updatedMemory.id ? updatedMemory : mem));
                    setEditingMemory(null);
                    if (infoMessage) {
                      setMessages((prevMessages) => {
                        const updated = [...prevMessages, { role: 'info' as const, content: infoMessage }];
                        localStorage.setItem('messages', JSON.stringify(updated));
                        return updated;
                      });
                    }
                  }}
                  onCancel={() => setEditingMemory(null)}
                />
              ) : memories.length > 0 ? (
                <ul className="memory-list">
                  {memories.map((mem) => (
                    <MemoryItem
                      key={mem.id}
                      memory={mem}
                      onEdit={setEditingMemory}
                      onDelete={(id, infoMessage) => {
                        setMemories((current) => current.filter((m) => m.id !== id));
                        if (infoMessage) {
                          setMessages((prevMessages) => {
                            const updated = [...prevMessages, { role: 'info' as const, content: infoMessage }];
                            localStorage.setItem('messages', JSON.stringify(updated));
                            return updated;
                          });
                        }
                      }}
                    />
                  ))}
                </ul>
              ) : (
                <p className="memories-empty">No memories saved yet.</p>
              )}
            </section>
          ) : isRelevantMemoriesOpen ? (
            <section className="memories-view relevant-memories-view" aria-labelledby="relevant-memories-title">
              <div className="memories-view-heading">
                <div>
                  <p className="eyebrow">Surfaced for this moment</p>
                  <h2 id="relevant-memories-title">Relevant memories</h2>
                </div>
                {!isRelevantMemoriesLoading && !relevantMemoriesError && (
                  <span className="memories-count">{relevantMemories.length} {relevantMemories.length === 1 ? 'memory' : 'memories'}</span>
                )}
              </div>
              {
                isRelevantMemoriesLoading ? (
                  <p>Loading relevant memories...</p>
                ) : relevantMemoriesError ? (
                  <div className="section-error" role="alert">
                    <p>{relevantMemoriesError}</p>
                  </div>
                ) : relevantMemories.length === 0 ? (
                  <p className="memories-empty">No relevant memories found.</p>
                ) : (                
                  <MemoryList memories={memories} relevantMemories={relevantMemories} />
                )
              }
            </section>
          ) : (
            <ConversationSection
              messages={messages}
              value={value}
              isSaving={isSaving}
              error={error}
              conversationEndRef={conversationEndRef}
              onValueChange={setValue}
              onSubmit={createMemory}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
