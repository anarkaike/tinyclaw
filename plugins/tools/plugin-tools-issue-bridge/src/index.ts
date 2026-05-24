/**
 * @tinyclaw/plugin-tools-issue-bridge
 *
 * Minimal issue bridge tools. These tools help the agent inspect and draft
 * issue-oriented context without taking risky side effects by default.
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

const ISSUE_BRIDGE_PLUGIN_ID = '@tinyclaw/plugin-tools-issue-bridge';

function getRepoFromConfig(context: AgentContext): string {
  return (
    context.configManager?.get<string>('github.contextRepo') ||
    context.configManager?.get<string>('github.repo') ||
    'anarkaike/tinyclaw-contexto-macos'
  );
}

async function runGh(args: string[]): Promise<string> {
  const proc = Bun.spawn(['gh', ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  if (code !== 0) {
    throw new Error(stderr.trim() || stdout.trim() || `gh exited with code ${code}`);
  }

  return stdout.trim();
}

const issueBridgePlugin: ToolsPlugin = {
  id: ISSUE_BRIDGE_PLUGIN_ID,
  name: 'Issue Bridge',
  description: 'Tools for reading and drafting GitHub issue context',
  type: 'tools',
  version: '0.1.0',

  createTools(context: AgentContext): Tool[] {
    const repo = getRepoFromConfig(context);

    return [
      {
        name: 'issue_bridge_list',
        description:
          'List recent issues from the configured repository so the agent can inspect current work.',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number of issues to return' },
            state: {
              type: 'string',
              description: 'Issue state',
              enum: ['open', 'closed', 'all'],
            },
          },
          required: [],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const limit = typeof args.limit === 'number' ? args.limit : 10;
          const state = (args.state as string) || 'open';
          return runGh([
            'issue',
            'list',
            '--repo',
            repo,
            '--state',
            state,
            '--limit',
            String(limit),
            '--json',
            'number,title,state,author,assignees,labels,comments,updatedAt,url',
          ]);
        },
      },
      {
        name: 'issue_bridge_view',
        description:
          'View a single issue with metadata so the agent can infer owner, reviewer, sprint, and next action.',
        parameters: {
          type: 'object',
          properties: {
            number: { type: 'number', description: 'Issue number' },
          },
          required: ['number'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const number = Number(args.number);
          if (!Number.isFinite(number) || number <= 0) {
            return 'Error: number must be a positive issue number.';
          }
          return runGh([
            'issue',
            'view',
            String(number),
            '--repo',
            repo,
            '--json',
            'number,title,state,body,author,assignees,labels,comments,updatedAt,url',
          ]);
        },
      },
      {
        name: 'issue_bridge_draft_comment',
        description:
          'Draft a concise issue comment that records understanding, action, tests, and result. This tool does not post automatically.',
        parameters: {
          type: 'object',
          properties: {
            number: { type: 'number', description: 'Issue number' },
            summary: { type: 'string', description: 'Short summary of understanding' },
            action: { type: 'string', description: 'What was done or will be done' },
            tests: { type: 'string', description: 'Tests or checks performed' },
            result: { type: 'string', description: 'Observed result' },
          },
          required: ['number', 'summary', 'action', 'tests', 'result'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const number = Number(args.number);
          if (!Number.isFinite(number) || number <= 0) {
            return 'Error: number must be a positive issue number.';
          }

          const summary = String(args.summary ?? '').trim();
          const action = String(args.action ?? '').trim();
          const tests = String(args.tests ?? '').trim();
          const result = String(args.result ?? '').trim();

          if (!summary || !action || !tests || !result) {
            return 'Error: all fields are required.';
          }

          return [
            `Issue #${number} draft comment:`,
            '',
            `Entendi: ${summary}`,
            `Fiz: ${action}`,
            `Testes: ${tests}`,
            `Resultado: ${result}`,
          ].join('\n');
        },
      },
    ];
  },
};

export default issueBridgePlugin;
