import { useMemo } from "react";

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
  // Costruiamo un Set con gli id "rilevanti", convertiti in stringa
  // per farli combaciare con Memory.id (che è string).
  // Senza questa conversione, Set.has() non troverebbe mai una
  // corrispondenza perché 1 (number) !== "1" (string) in JS/TS.
  const relevantIds = useMemo<Set<number>>(
    () => new Set(relevantMemories.map((m) => m.memoryId)),
    [relevantMemories]
  );
  console.log("Relevant IDs:", relevantIds); // Debug: stampiamo il Set di ID rilevanti

  // Filtriamo l'array completo, tenendo solo le memorie il cui id
  // è presente nel Set di quelle rilevanti.
  const visibleMemories = memories.filter((memory) =>
  {
    return relevantIds.has(memory.id)
  }
  );
  console.log("Visible Memories:", visibleMemories); // Debug: stampiamo le memorie filtrate

  return (
    <div className="memory-list">
      {visibleMemories.map((memory) => (
        // key = memory.id, valore stabile e univoco per ogni elemento
        <MemoryCard key={memory.id} memory={memory} />
      ))}
    </div>
  );
}

interface MemoryCardProps {
  memory: Memory;
}

function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <div className="memory-card">
      <h3 className="memory-card-title">{memory.title}</h3>
      <p className="memory-card-content">{memory.content}</p>
      {/* date/time sono opzionali, quindi li mostriamo solo se presenti */}
      {memory.date && <span>{memory.date}</span>}
      {memory.time && <span>{memory.time}</span>}
    </div>
  );
}

export default MemoryList;