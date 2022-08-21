import { dirname } from 'https://deno.land/std@0.54.0/path/mod.ts';
import { ensureDir } from 'https://deno.land/std@0.152.0/fs/mod.ts';
import type { Options } from '../src/mod.ts';
import { runnerActions } from './runner-actions.ts';

export class TestFileManager {
  basePath = `./e2e/test-artifacts/${Math.random()}/`;
  async start() {
    await ensureDir(this.basePath);
  }
  async end() {
    await Deno.remove(this.basePath, { recursive: true });
  }
  async add(obj: Record<string, string>) {
    for (const [filePath, content] of Object.entries(obj)) {
      await this.addFile(filePath, content);
    }
  }
  async addFile(path: string, content: string) {
    if (!path.startsWith('./')) {
      throw new Error(`path must start with "./". Got "${path}"`);
    }
    const fullPath = path.replace('./', this.basePath);
    await ensureDir(dirname(fullPath));
    await Deno.writeTextFile(fullPath, content);
  }
  async deleteFile(path: string) {
    if (!path.startsWith('./')) {
      throw new Error(`path must start with "./". Got "${path}"`);
    }
    const fullPath = path.replace('./', this.basePath);
    await Deno.remove(fullPath);
  }
  async getFileContent(path: string) {
    if (!path.startsWith('./')) {
      throw new Error(`path must start with "./". Got "${path}"`);
    }
    const fullPath = path.replace('./', this.basePath);
    return await Deno.readTextFile(fullPath);
  }
}
export const sleep = (timer: number) =>
  new Promise((resolve) => setTimeout(resolve, timer));
export const startServer = async (
  options: Partial<Options>,
  extra: Array<keyof typeof runnerActions> = [],
) => {
  const runner = `
    import { DenoLivereloadLite } from './src/mod.ts';
    import { runnerActions } from './e2e/runner-actions.ts';
    const actions = ${JSON.stringify([...extra])};
    let options = ${JSON.stringify(options)};
    actions.forEach(action => {
      if (!Object.hasOwn(runnerActions, action)) {
        throw new Error("Unknown action '" + action + "'. Found (" + Object.keys(actions).join(', ') + ")");
      }
      Object.assign(options, runnerActions[action]());
    });
    new DenoLivereloadLite(options).start();
  `.trim().split('\n').map((i) => i.trim()).join('');
  const app = Deno.run({ cmd: ['deno', 'eval', runner] });

  for (let i = 0; i < 10; i++) {
    try {
      const pre = await fetch(
        `http://localhost:${options.port}/129422f3-685f-4518-b9fe-a506059fcc8b-endpoint-to-validate-server-is-running-for-testing`,
      );
      await pre.blob();
      if (pre.status === 418) break;
    } catch (_err) {}
    await sleep(500);
  }
  return app;
};

export const close = async (item?: { close: () => any }) => {
  if (!item) return;
  await sleep(500);
  try {
    await item.close();
  } catch (_err) {}
  await sleep(500);
};
