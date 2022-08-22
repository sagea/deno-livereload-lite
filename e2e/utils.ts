import type { Options } from '../src/mod.ts';
import { runnerActions } from './runner-actions.ts';

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
      // deno-lint-ignore no-empty
    } catch (_err) {}
    await sleep(500);
  }
  return app;
};

export const close = async (...items: Array<{ close: () => unknown }>) => {
  await Promise.allSettled(items.map(async (item) => {
    await sleep(500);
    try {
      await item.close();
      // deno-lint-ignore no-empty
    } catch (_err) {}
    await sleep(500);
  }));
};
