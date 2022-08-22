import { expect, step } from '../src/testUtils/mod.ts';
import { copy } from 'https://deno.land/std@0.152.0/fs/mod.ts';
import { close, startServer } from './utils.ts';

Deno.test('04-globalResponseHeaders-option', async (t) => {
  const BASE = `./e2e/test-artifacts/${Math.random()}`;
  await copy(`./e2e/test-artifacts/base`, BASE);
  await step(t, 'should serve static content', async (t) => {
    const process = await startServer({
      port: 9999,
      path: BASE + '/public',
      globalResponseHeaders: { foo: 'bar', a: 'b' },
    });

    await step(t, 'should add global headers to all requests', async (t) => {
      await step(t, 'existing static content', async (_) => {
        const pre = await fetch('http://localhost:9999/deep/deep-test.js');
        expect(await pre.text()).toEqual(`console.log('deep-test.js');`);
        expect(pre.headers.get('foo')).toEqual('bar');
        expect(pre.headers.get('a')).toEqual('b');
      });

      await step(t, 'not found content', async (_) => {
        const pre = await fetch(
          'http://localhost:9999/awesome/does-not-exist.js',
        );
        await pre.blob();
        expect(pre.status).toEqual(404);
        expect(pre.headers.get('foo')).toEqual('bar');
        expect(pre.headers.get('a')).toEqual('b');
      });
    });

    await close(process);
  });
  await Deno.remove(BASE, { recursive: true });
});
