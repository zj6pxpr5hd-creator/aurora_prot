type Memory = {
  id: number;
  type: string;
  title: string;
  content: string;
  date?: string;
  time?: string;
};

type RelevantMemory = {
  memoryId: number;
  reason: string;
};

interface MemoryListProps {
  memories: Memory[];
  relevantMemories: RelevantMemory[];
}

function MemoryList({ memories, relevantMemories }: MemoryListProps) {
  const visibleMemories = relevantMemories
    .map((relevantMemory) => ({
      memory: memories.find((memory) => memory.id === relevantMemory.memoryId),
      reason: relevantMemory.reason,
    }))
    .filter((item): item is { memory: Memory; reason: string } => Boolean(item.memory));

  return (
    <ul className="relevant-memory-list">
      {visibleMemories.map(({ memory, reason }, index) => (
        <MemoryCard key={memory.id} memory={memory} reason={reason} rank={index + 1} />
      ))}
    </ul>
  );
}

interface MemoryCardProps {
  memory: Memory;
  reason: string;
  rank: number;
}

function MemoryCard({ memory, reason, rank }: MemoryCardProps) {
  return (
    <li className="relevant-memory-card">
      <div className="relevant-memory-card-header">
        <div>
          <span className="memory-type">{memory.type}</span>
          <h3>{memory.title}</h3>
        </div>
        <span className="relevant-memory-marker" aria-hidden="true">{String(rank).padStart(2, '0')}</span>
      </div>
      <p className="relevant-memory-content">{memory.content}</p>
      <div className="relevant-memory-meta">
        {memory.date && <time dateTime={memory.date}>{memory.date}</time>}
        {memory.time && <span>{memory.time}</span>}
      </div>
      <p className="relevant-memory-reason">
        <span>Why it surfaced</span>
        {reason}
      </p>
    </li>
  );
}

export default MemoryList;