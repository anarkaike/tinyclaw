/**
 * @tinyclaw/plugin-tools-security-watch
 *
 * Security watch tools for Tiny Claw. Exposes SHIELD-oriented inspection and
 * a concise operational report for risky states.
 */

import type { ShieldEngine, ThreatEntry, ThreatSeverity, ThreatScope } from '../../../../packages/types/src/index.ts';

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
  createTools(context: { shield?: ShieldEngine }): Tool[];
};

const SECURITY_WATCH_PLUGIN_ID = '@tinyclaw/plugin-tools-security-watch';

function severityRank(severity: ThreatSeverity): number {
  return { critical: 4, high: 3, medium: 2, low: 1 }[severity];
}

const securityWatchPlugin: ToolsPlugin = {
  id: SECURITY_WATCH_PLUGIN_ID,
  name: 'Security Watch',
  description: 'Security and SHIELD inspection tools',
  type: 'tools',
  version: '0.1.0',

  createTools(context: { shield?: ShieldEngine }): Tool[] {
    return [
      {
        name: 'security_status',
        description:
          'Report a concise security status for the current runtime using the SHIELD engine when available.',
        parameters: { type: 'object', properties: {}, required: [] },
        async execute(): Promise<string> {
          if (!context.shield) {
            return 'Security engine is not available.';
          }
          const report = context.shield.getReport?.();
          return report ? JSON.stringify(report, null, 2) : 'Security engine is active.';
        },
      },
      {
        name: 'security_eval',
        description:
          'Evaluate a scope or action pattern against the current SHIELD rules and return the decision.',
        parameters: {
          type: 'object',
          properties: {
            scope: { type: 'string', description: 'Threat scope' },
            toolName: { type: 'string', description: 'Tool name to evaluate' },
          },
          required: ['scope'],
        },
        async execute(args: Record<string, unknown>): Promise<string> {
          if (!context.shield) return 'Security engine is not available.';
          const scope = String(args.scope ?? '').trim() as ThreatScope;
          const toolName = String(args.toolName ?? '').trim();
          const decision = context.shield.evaluate?.({ scope, toolName } as never);
          return decision ? JSON.stringify(decision, null, 2) : 'No decision returned.';
        },
      },
      {
        name: 'security_threats',
        description:
          'List active threats in descending severity order so the agent can decide whether to pause or continue.',
        parameters: { type: 'object', properties: {}, required: [] },
        async execute(): Promise<string> {
          if (!context.shield) return 'Security engine is not available.';
          const threats = (context.shield.getThreats?.() ?? []).slice().sort(
            (a: ThreatEntry, b: ThreatEntry) => severityRank(b.severity) - severityRank(a.severity),
          );
          return JSON.stringify(threats, null, 2);
        },
      },
    ];
  },
};

export default securityWatchPlugin;
