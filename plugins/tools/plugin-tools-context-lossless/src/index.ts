/**
 * @tinyclaw/plugin-tools-context-lossless
 *
 * Lossless context tools for Tiny Claw. Provides a predictable interface over
 * compaction, recall, and context expansion.
 */

import {
  compressContext,
  compressContextWithStats,
  decompressText,
} from '../../../../packages/compactor/src/index.ts';

type Tool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(args: Record<string, unknown>): Promise<string>;
};

type ToolsPlugin = {
  id: string;
  name: string;
  description: string;
  type: 'tools';
  version: string;
  createTools(): Tool[];
};

const CONTEXT_LOSSLESS_PLUGIN_ID = '@tinyclaw/plugin-tools-context-lossless';

const contextLosslessPlugin: ToolsPlugin = {
  id: CONTEXT_LOSSLESS_PLUGIN_ID,
  name: 'Context Lossless',
  description: 'Lossless context compaction and recall tools',
  type: 'tools',
  version: '0.1.0',

  createTools(): Tool[] {
    return [
      {
        name: 'context_compact',
        description:
          'Compact markdown or conversational context while preserving meaning and structure as much as possible.',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Context text to compact' },
            level: {
              type: 'string',
              enum: ['ultra', 'medium', 'light'],
              description: 'Compaction strength',
            },
          },
          required: ['text'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const text = String(args.text ?? '').trim();
          const level = (String(args.level ?? 'medium') as 'ultra' | 'medium' | 'light') || 'medium';
          if (!text) return 'Error: text is required.';
          const result = compressContext(text, level);
          return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        },
      },
      {
        name: 'context_compact_stats',
        description:
          'Compact context and return a readable report with stats, token savings and the compacted text.',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Context text to compact' },
            level: {
              type: 'string',
              enum: ['ultra', 'medium', 'light'],
              description: 'Compaction strength',
            },
          },
          required: ['text'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const text = String(args.text ?? '').trim();
          const level = (String(args.level ?? 'medium') as 'ultra' | 'medium' | 'light') || 'medium';
          if (!text) return 'Error: text is required.';
          const result = compressContextWithStats(text, level);
          return JSON.stringify(result, null, 2);
        },
      },
      {
        name: 'context_expand',
        description:
          'Expand a losslessly compressed context back into a readable form when the data was encoded with the Tiny Claw compactor.',
        parameters: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Compressed context text' },
          },
          required: ['text'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const text = String(args.text ?? '').trim();
          if (!text) return 'Error: text is required.';
          return decompressText(text);
        },
      },
    ];
  },
};

export default contextLosslessPlugin;
