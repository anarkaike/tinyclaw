/**
 * @tinyclaw/plugin-tools-channel-bridge
 *
 * Minimal channel bridge tools for Tiny Claw. It normalizes channel-facing
 * requests and drafts safe responses for web, Telegram and WhatsApp.
 */

type Tool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(args: Record<string, unknown>): Promise<string>;
};

type AgentContext = {
  configManager?: {
    get<T = unknown>(key: string): T | undefined;
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

const CHANNEL_BRIDGE_PLUGIN_ID = '@tinyclaw/plugin-tools-channel-bridge';

function normalizeChannel(channel: string): 'web' | 'telegram' | 'whatsapp' | 'unknown' {
  const normalized = channel.trim().toLowerCase();
  if (normalized.includes('telegram')) return 'telegram';
  if (normalized.includes('whatsapp')) return 'whatsapp';
  if (normalized.includes('web')) return 'web';
  return 'unknown';
}

const channelBridgePlugin: ToolsPlugin = {
  id: CHANNEL_BRIDGE_PLUGIN_ID,
  name: 'Channel Bridge',
  description: 'Channel normalization and response drafting tools',
  type: 'tools',
  version: '0.1.0',

  createTools(context: AgentContext): Tool[] {
    return [
      {
        name: 'channel_route',
        description:
          'Normalize a channel name and return the canonical route used by the hub.',
        parameters: {
          type: 'object',
          properties: {
            channel: { type: 'string', description: 'Channel name' },
          },
          required: ['channel'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const channel = String(args.channel ?? '').trim();
          if (!channel) return 'Error: channel is required.';
          const canonical = normalizeChannel(channel);
          return JSON.stringify(
            {
              channel,
              canonical,
              repo: context.configManager?.get<string>('github.contextRepo') || 'anarkaike/tinyclaw-contexto-macos',
            },
            null,
            2,
          );
        },
      },
      {
        name: 'channel_draft_reply',
        description:
          'Draft a safe reply for a given channel while keeping the core decision logic external.',
        parameters: {
          type: 'object',
          properties: {
            channel: { type: 'string', description: 'Channel name' },
            summary: { type: 'string', description: 'What the agent understood' },
            action: { type: 'string', description: 'What the agent will do' },
            result: { type: 'string', description: 'Expected or observed result' },
          },
          required: ['channel', 'summary', 'action', 'result'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const channel = String(args.channel ?? '').trim();
          const summary = String(args.summary ?? '').trim();
          const action = String(args.action ?? '').trim();
          const result = String(args.result ?? '').trim();
          if (!channel || !summary || !action || !result) {
            return 'Error: channel, summary, action and result are required.';
          }
          return [
            `Canal: ${channel}`,
            `Entendi: ${summary}`,
            `Fiz: ${action}`,
            `Resultado: ${result}`,
          ].join('\n');
        },
      },
      {
        name: 'channel_context_hint',
        description:
          'Return the preferred channel hint for the current hub configuration so routing stays consistent.',
        parameters: { type: 'object', properties: {}, required: [] },
        async execute(): Promise<string> {
          return JSON.stringify(
            {
              plugin: CHANNEL_BRIDGE_PLUGIN_ID,
              preferred: 'web',
              supported: ['web', 'telegram', 'whatsapp'],
            },
            null,
            2,
          );
        },
      },
    ];
  },
};

export default channelBridgePlugin;
