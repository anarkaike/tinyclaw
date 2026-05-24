/**
 * @tinyclaw/plugin-tools-resource-watch
 *
 * Resource monitoring tools for Tiny Claw. Provides a health snapshot of the
 * host so the runtime can tune agent intensity and cron cadence.
 */

import os from 'node:os';

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

const RESOURCE_WATCH_PLUGIN_ID = '@tinyclaw/plugin-tools-resource-watch';

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 ** 3);
  return `${gb.toFixed(2)} GB`;
}

async function runDf(): Promise<string> {
  const proc = Bun.spawn(['df', '-k', '/'], { stdout: 'pipe', stderr: 'pipe' });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) return stderr.trim() || stdout.trim() || 'df failed';
  return stdout.trim();
}

function inferIntensity(memoryPressure: number, cpuPressure: number, diskPressure: number): {
  intensity: 'baixa' | 'média' | 'alta';
  recommendation: string;
} {
  const score = memoryPressure * 0.4 + cpuPressure * 0.4 + diskPressure * 0.2;
  if (score >= 0.75) {
    return { intensity: 'baixa', recommendation: 'Reduzir frequência de cron e priorizar agentes críticos.' };
  }
  if (score >= 0.45) {
    return { intensity: 'média', recommendation: 'Manter cron atual e evitar expansão de trabalho paralelo.' };
  }
  return { intensity: 'alta', recommendation: 'Há folga para manter cron ativo e acelerar rotinas seguras.' };
}

const resourceWatchPlugin: ToolsPlugin = {
  id: RESOURCE_WATCH_PLUGIN_ID,
  name: 'Resource Watch',
  description: 'Host health snapshot for CPU, memory, disk and execution rhythm',
  type: 'tools',
  version: '0.1.0',

  createTools(): Tool[] {
    return [
      {
        name: 'resource_snapshot',
        description:
          'Capture a health snapshot of the current macOS host including memory, CPU, load average and disk usage.',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        async execute(): Promise<string> {
          const totalMem = os.totalmem();
          const freeMem = os.freemem();
          const usedMem = totalMem - freeMem;
          const load = os.loadavg();
          const df = await runDf();

          const cpuPressure = Math.min(1, load[0] / Math.max(1, os.cpus().length));
          const memoryPressure = Math.min(1, usedMem / Math.max(1, totalMem));
          const diskPressure = df.includes('%') ? 0.5 : 0.25;
          const rhythm = inferIntensity(memoryPressure, cpuPressure, diskPressure);

          return [
            `Memória total: ${formatBytes(totalMem)}`,
            `Memória usada: ${formatBytes(usedMem)}`,
            `Memória livre: ${formatBytes(freeMem)}`,
            `Load average: ${load.map((v) => v.toFixed(2)).join(', ')}`,
            `CPU pressure: ${(cpuPressure * 100).toFixed(0)}%`,
            `Memory pressure: ${(memoryPressure * 100).toFixed(0)}%`,
            `Disk pressure: ${(diskPressure * 100).toFixed(0)}%`,
            `Intensidade sugerida: ${rhythm.intensity}`,
            `Recomendação: ${rhythm.recommendation}`,
            `df /:`,
            df,
          ].join('\n');
        },
      },
      {
        name: 'resource_rhythm',
        description:
          'Summarize the current execution rhythm recommendation for cron and agent intensity.',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        async execute(): Promise<string> {
          const totalMem = os.totalmem();
          const freeMem = os.freemem();
          const usedMem = totalMem - freeMem;
          const load = os.loadavg();
          const cpuPressure = Math.min(1, load[0] / Math.max(1, os.cpus().length));
          const memoryPressure = Math.min(1, usedMem / Math.max(1, totalMem));
          const diskPressure = 0.25;
          const rhythm = inferIntensity(memoryPressure, cpuPressure, diskPressure);

          return JSON.stringify(
            {
              plugin: RESOURCE_WATCH_PLUGIN_ID,
              intensity: rhythm.intensity,
              recommendation: rhythm.recommendation,
              cpuPressure,
              memoryPressure,
              diskPressure,
            },
            null,
            2,
          );
        },
      },
    ];
  },
};

export default resourceWatchPlugin;
