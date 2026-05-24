/**
 * @tinyclaw/plugin-tools-project-runner
 *
 * Project runner tools for Tiny Claw. Organizes backlog, sprint, recurrence
 * and execution rhythm without reimplementing the scheduler.
 */

import type { Tool } from '../../../../packages/types/src/index.ts';

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

const PROJECT_RUNNER_PLUGIN_ID = '@tinyclaw/plugin-tools-project-runner';

function getProjectKey(context: AgentContext): string {
  return context.configManager?.get<string>('github.contextRepo') || 'anarkaike/tinyclaw-contexto-macos';
}

const projectRunnerPlugin: ToolsPlugin = {
  id: PROJECT_RUNNER_PLUGIN_ID,
  name: 'Project Runner',
  description: 'Backlog, sprint and recurrence organization tools',
  type: 'tools',
  version: '0.1.0',

  createTools(context: AgentContext): Tool[] {
    return [
      {
        name: 'project_plan',
        description:
          'Create a concise operational plan for a project using backlog, sprint, recurrence and execution status.',
        parameters: {
          type: 'object',
          properties: {
            project: { type: 'string', description: 'Project name' },
            sprint: { type: 'string', description: 'Current sprint or cycle' },
            objective: { type: 'string', description: 'Main objective' },
          },
          required: ['project', 'objective'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const project = String(args.project ?? '').trim();
          const sprint = String(args.sprint ?? '').trim();
          const objective = String(args.objective ?? '').trim();
          if (!project || !objective) return 'Error: project and objective are required.';

          return [
            `Project: ${project}`,
            `Repo: ${getProjectKey(context)}`,
            `Sprint: ${sprint || 'N/D'}`,
            `Objective: ${objective}`,
            `Backlog: pending items are grouped by issue and sprint`,
            `Recurrence: daily steward + cron-reviewed`,
          ].join('\n');
        },
      },
      {
        name: 'project_rhythm',
        description:
          'Summarize the operational rhythm for a project, including backlog, sprint and recurring work.',
        parameters: {
          type: 'object',
          properties: {
            project: { type: 'string', description: 'Project name' },
            backlog: { type: 'number', description: 'Backlog count estimate' },
            sprint: { type: 'string', description: 'Sprint identifier' },
          },
          required: ['project'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const project = String(args.project ?? '').trim();
          const backlog = typeof args.backlog === 'number' ? args.backlog : undefined;
          const sprint = String(args.sprint ?? '').trim();
          if (!project) return 'Error: project is required.';

          return JSON.stringify(
            {
              plugin: PROJECT_RUNNER_PLUGIN_ID,
              project,
              repo: getProjectKey(context),
              backlog: backlog ?? 'unknown',
              sprint: sprint || 'N/D',
              rhythm: backlog && backlog > 20 ? 'desacelerar e priorizar' : 'ritmo normal',
            },
            null,
            2,
          );
        },
      },
      {
        name: 'project_recurrence',
        description:
          'Describe a recurring task so the cron can keep it active with a stable cadence.',
        parameters: {
          type: 'object',
          properties: {
            project: { type: 'string', description: 'Project name' },
            recurrence: { type: 'string', description: 'Recurrence description' },
            cadence: { type: 'string', description: 'Cadence like 5m, 24h' },
          },
          required: ['project', 'recurrence'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          const project = String(args.project ?? '').trim();
          const recurrence = String(args.recurrence ?? '').trim();
          const cadence = String(args.cadence ?? '').trim();
          if (!project || !recurrence) return 'Error: project and recurrence are required.';

          return [
            `Project: ${project}`,
            `Recurrence: ${recurrence}`,
            `Cadence: ${cadence || 'N/D'}`,
            `Action: keep cron active, log results, and update issue history`,
          ].join('\n');
        },
      },
    ];
  },
};

export default projectRunnerPlugin;
