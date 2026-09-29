import * as z from 'zod';

/**
 * Zod schema validating an individual memory item extracted or stored.
 */
export const MemorySchema = z.object({
  type: z.enum(["event", "task", "note", "goal"]),
  title: z.string(),
  content: z.string(),
  date: z.string().nullable(),
  time: z.string().nullable(),
});

/**
 * Zod schema validating memory extraction AI responses.
 */
export const AIResponseSchema = z.object({
  memories: z.array(MemorySchema),
});

/**
 * JSON schema expected from Gemini API when extracting memories from user input.
 */
export const aiResponseJsonSchema = {
  type: "object",
  properties: {
    memories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["event", "task", "note", "goal"],
          },
          title: {
            type: "string",
          },
          content: {
            type: "string",
          },
          date: {
            type: ["string", "null"],
          },
          time: {
            type: ["string", "null"],
          },
        },
        required: ["type", "title", "content", "date", "time"],
      },
    },
  },
  required: ["memories"],
};

/**
 * Zod schema validating relevant memories AI responses.
 */
export const contextualAIResponseSchema = z.object({
  relevantMemories: z.array(z.object({
    memoryId: z.number(),
    reason: z.string(),
  })),
});

/**
 * JSON schema expected from Gemini API when surfacing relevant memories.
 */
export const contextualAiResponseJsonSchema = {
  type: "object",
  properties: {
    relevantMemories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          memoryId: {
            type: "number",
          },
          reason: {
            type: "string",
          },
        },
        required: ["memoryId", "reason"],
      },
    },
  },
  required: ["relevantMemories"],
};
