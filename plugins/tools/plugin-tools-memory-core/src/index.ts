/**
 * @tinyclaw/plugin-tools-memory-core
 *
 * Memory core tools for Tiny Claw. Provides a simple operational layer over
 * the built-in memory engine and legacy key-value memory store.
 */

type Tool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(args: Record<string, unknown>): Promise<string>;
};

type AgentContext = {
  memory?: {
    recordEvent(
      userId: string,
      event: {
        type: 'task_completed' | 'preference_learned' | 'correction' | 'delegation_result' | 'fact_stored';
        content: string;
        outcome?: string;
        importance?: number;
        sphere?: 'pessoal' | 'profissional' | 'amizades' | 'familiar';
        memoryType?:
          | 'história'
          | 'epic'
          | 'issue'
          | 'tarefa'
          | 'subissue'
          | 'subtarefa'
          | 'checklist'
          | 'sprint'
          | 'recorrência'
          | 'recurso';
      },
    ): string;
    search(userId: string, query: string, limit?: number): Array<{
      id: string;
      content: string;
      relevanceScore: number;
      source: 'episodic' | 'key_value';
    }>;
    getContextForAgent(userId: string, query?: string): string;
  };
  db?: {
    saveMemory(userId: string, key: string, value: string): void;
  };
};

type ToolsPlugin = {
  id: string;
  name: string;
  description: string;
  type: 'tools';
  version: string;
  createTools(context: AgentContext): Tool[];
};

const MEMORY_CORE_PLUGIN_ID = '@tinyclaw/plugin-tools-memory-core';

function getMemoryContext(context: AgentContext) {
  if (!context.memory || !context.db) {
    throw new Error('memory engine is not available in this runtime');
  }
  return { memory: context.memory, db: context.db };
}

const memoryCorePlugin: ToolsPlugin = {
  id: MEMORY_CORE_PLUGIN_ID,
  name: 'Memory Core',
  description: 'Operational tools for persistent memory and recall',
  type: 'tools',
  version: '0.1.0',

  createTools(context: AgentContext): Tool[] {
    const tools: Tool[] = [
      {
        name: 'memory_store_fact',
        description:
          'Store a durable fact in the Tiny Claw memory engine. Use for preferences, project decisions, and stable facts. Keep the text concise and include scope if relevant.',
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Target user/session scope' },
            sphere: {
              type: 'string',
              description: 'Memory sphere',
              enum: ['pessoal', 'profissional', 'amizades', 'familiar'],
            },
            memoryType: {
              type: 'string',
              description: 'Structured memory type',
              enum: [
                'história',
                'epic',
                'issue',
                'tarefa',
                'subissue',
                'subtarefa',
                'checklist',
                'sprint',
                'recorrência',
                'recurso',
              ],
            },
            content: { type: 'string', description: 'Fact to store' },
            outcome: { type: 'string', description: 'Optional result or conclusion' },
            importance: { type: 'number', description: 'Importance score from 0 to 1' },
          },
          required: ['userId', 'content'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const { memory } = getMemoryContext(context);
          const userId = String(args.userId ?? '').trim();
          const sphere = String(args.sphere ?? '').trim() || undefined;
          const memoryType = String(args.memoryType ?? '').trim() || undefined;
          const content = String(args.content ?? '').trim();
          const outcome = String(args.outcome ?? '').trim();
          const importance = typeof args.importance === 'number' ? args.importance : undefined;

          if (!userId) return 'Error: userId is required.';
          if (!content) return 'Error: content is required.';

          const id = memory.recordEvent(userId, {
            type: 'fact_stored',
            sphere: sphere as 'pessoal' | 'profissional' | 'amizades' | 'familiar' | undefined,
            memoryType:
              memoryType as
                | 'história'
                | 'epic'
                | 'issue'
                | 'tarefa'
                | 'subissue'
                | 'subtarefa'
                | 'checklist'
                | 'sprint'
                | 'recorrência'
                | 'recurso'
                | undefined,
            content,
            outcome: outcome || undefined,
            importance,
          });

          return `Memory stored successfully. id=${id}`;
        },
      },
      {
        name: 'memory_search',
        description:
          'Search the Tiny Claw memory engine for relevant context by query and scope.',
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Target user/session scope' },
            sphere: {
              type: 'string',
              description: 'Memory sphere filter',
              enum: ['pessoal', 'profissional', 'amizades', 'familiar'],
            },
            query: { type: 'string', description: 'Search query' },
            limit: { type: 'number', description: 'Maximum number of results' },
          },
          required: ['userId', 'query'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const { memory } = getMemoryContext(context);
          const userId = String(args.userId ?? '').trim();
          const sphere = String(args.sphere ?? '').trim();
          const query = String(args.query ?? '').trim();
          const limit = typeof args.limit === 'number' ? args.limit : 5;

          if (!userId) return 'Error: userId is required.';
          if (!query) return 'Error: query is required.';

          const results = memory.search(userId, sphere ? `${sphere} ${query}` : query, limit);
          if (results.length === 0) return 'No memory results found.';

          return results
            .map(
              (
                result: { source: string; id: string; relevanceScore: number; content: string },
                index: number,
              ) =>
                `${index + 1}. [${result.source}] ${result.id} (${result.relevanceScore.toFixed(3)}): ${result.content}`,
            )
            .join('\n');
        },
      },
      {
        name: 'memory_context',
        description:
          'Build a compact memory context block for agent prompts based on scope and query.',
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Target user/session scope' },
            sphere: {
              type: 'string',
              description: 'Memory sphere to include in context',
              enum: ['pessoal', 'profissional', 'amizades', 'familiar'],
            },
            query: { type: 'string', description: 'Optional query for recall' },
          },
          required: ['userId'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const { memory } = getMemoryContext(context);
          const userId = String(args.userId ?? '').trim();
          const sphere = String(args.sphere ?? '').trim();
          const query = String(args.query ?? '').trim();

          if (!userId) return 'Error: userId is required.';

          const block = memory.getContextForAgent(userId, sphere ? `${sphere} ${query}` : query || undefined);
          return block || 'No memory context available.';
        },
      },
      {
        name: 'memory_store_note',
        description:
          'Store a lightweight key-value note in legacy memory for quick preferences and reminders.',
        parameters: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'Target user/session scope' },
            sphere: {
              type: 'string',
              description: 'Memory sphere',
              enum: ['pessoal', 'profissional', 'amizades', 'familiar'],
            },
            memoryType: {
              type: 'string',
              description: 'Structured memory type',
              enum: [
                'história',
                'epic',
                'issue',
                'tarefa',
                'subissue',
                'subtarefa',
                'checklist',
                'sprint',
                'recorrência',
                'recurso',
              ],
            },
            key: { type: 'string', description: 'Note key' },
            value: { type: 'string', description: 'Note value' },
          },
          required: ['userId', 'key', 'value'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const { db } = getMemoryContext(context);
          const userId = String(args.userId ?? '').trim();
          const sphere = String(args.sphere ?? '').trim();
          const memoryType = String(args.memoryType ?? '').trim();
          const key = String(args.key ?? '').trim();
          const value = String(args.value ?? '').trim();

          if (!userId) return 'Error: userId is required.';
          if (!key) return 'Error: key is required.';
          if (!value) return 'Error: value is required.';

          db.saveMemory(userId, `${sphere || 'geral'}:${memoryType || 'nota'}:${key}`, value);
          return `Legacy note stored successfully. ${key}=${value}`;
        },
      },
    ];

    return tools;
  },
};

export default memoryCorePlugin;
