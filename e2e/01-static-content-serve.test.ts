import { expect, step } from '../src/testUtils/mod.ts';
import { copy } from 'https://deno.land/std@0.152.0/fs/mod.ts';
import { close, startServer } from './utils.ts';
Deno.test('01-static-content-serve', async (t) => {
  const BASE = `./e2e/test-artifacts/${Math.random()}`;
  await copy(`./e2e/test-artifacts/base`, BASE);
  await step(t, 'should serve static content', async (t) => {
    const process = await startServer({
      port: 9999,
      path: BASE + '/public',
    });
    await step(t, 'should send index.html if path / is provided', async (_) => {
      const pre = await fetch('http://localhost:9999/');
      expect(await pre.text()).toEqual('<html></html>');
    });
    await step(t, 'should return static content deeply nested', async (_) => {
      const pre = await fetch('http://localhost:9999/deep/deep-test.js');
      expect(await pre.text()).toEqual(`console.log('deep-test.js');`);
    });
    await step(t, 'should return static content one level deep', async (_) => {
      const pre = await fetch('http://localhost:9999/a.js');
      expect(await pre.text()).toEqual(`console.log('a.js');`);
    });

    await step(t, 'should return 404 if file does not exit', async (_) => {
      const pre = await fetch(
        'http://localhost:9999/awesome/does-not-exist.js',
      );
      await pre.blob();
      expect(pre.status).toEqual(404);
    });
    await step(
      t,
      'should return 404 if file from different path is watched',
      async (_) => {
        const pre = await fetch('http://localhost:9999/other.js');
        await pre.blob();
        expect(pre.status).toEqual(404);
      },
    );
    await close(process);
  });
  await Deno.remove(BASE, { recursive: true });
});
