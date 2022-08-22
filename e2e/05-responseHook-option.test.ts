import { expect, step } from '../src/testUtils/mod.ts';
import { copy } from 'https://deno.land/std@0.152.0/fs/mod.ts';
import { close, startServer } from './utils.ts';

Deno.test('05-responseHook-option', async (t) => {
  const BASE = `./e2e/test-artifacts/${Math.random()}`;
  await copy(`./e2e/test-artifacts/base`, BASE);
  await step(t, 'should serve static content', async (t) => {
    const process = await startServer({
      port: 9999,
      path: BASE + '/public',
    }, ['custom-response-basic-hook']);

    await step(
      t,
      'should allow for a modification of the Response before sending to the client',
      async () => {
        const pre = await fetch('http://localhost:9999/deep/deep-test.js');
        const text = await pre.text();
        expect(text.endsWith('add-ending-to-hook')).toEqual(true);
      },
    );
    await close(process);
  });
  await Deno.remove(BASE, { recursive: true });
});
