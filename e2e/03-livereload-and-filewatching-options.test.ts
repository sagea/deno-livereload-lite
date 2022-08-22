import { expect, step } from '../src/testUtils/mod.ts';
import { copy } from 'https://deno.land/std@0.152.0/fs/mod.ts';
import { close, sleep, startServer } from './utils.ts';

Deno.test('03-livereload-and-filewatching-options', async (t) => {
  const BASE = `./e2e/test-artifacts/${Math.random()}`;
  await copy(`./e2e/test-artifacts/base`, BASE);
  await step(t, 'should watch for file changes based on path', async (t) => {
    await step(
      t,
      'should accept websocket connections and fire change event',
      async (t) => {
        const process = await startServer({
          port: 9999,
          path: BASE + '/public',
        });

        const websocket = new WebSocket(
          'ws://localhost:9999/livereload/websocket',
        );

        let events: string[] = [];
        websocket.onmessage = (e) => events.push(e.data);
        await sleep(500);
        await step(t, 'update file', async (_) => {
          await Deno.writeTextFile(BASE + '/public/deep/deep-test.js', 'data2');
          await sleep(500);
          expect(events).toEqual(['change-detected']);
          events = [];
        });
        await step(t, 'add new file', async (_) => {
          await Deno.writeTextFile(BASE + '/public/deep/newfile.js', 'data2');
          await sleep(500);
          expect(events).toEqual(['change-detected']);
          events = [];
        });
        await step(t, 'delete file', async (_) => {
          await Deno.remove(BASE + '/public/deep/newfile.js');
          await sleep(500);
          expect(events).toEqual(['change-detected']);
          events = [];
        });
        await step(t, 'update non watched file', async (_) => {
          await Deno.writeTextFile(BASE + '/not-public/other.js', 'woah');
          await sleep(500);
          expect(events).toEqual([]);
          events = [];
        });
        await close(websocket);
        await close(process);
      },
    );
    await step(
      t,
      'should be able to define a different watch path',
      async (t) => {
        const process = await startServer({
          port: 9999,
          path: BASE + '/public',
          watchPath: BASE + '/public/deep',
        });

        const websocket = new WebSocket(
          'ws://localhost:9999/livereload/websocket',
        );
        let events: string[] = [];
        websocket.onmessage = (e) => events.push(e.data);
        await sleep(500);
        await step(
          t,
          'should watch for changes inside of custom watchPath',
          async (_) => {
            await Deno.writeTextFile(
              BASE + '/public/deep/deep-test.js',
              'data2',
            );
            await sleep(500);
            expect(events).toEqual(['change-detected']);
            events = [];
          },
        );
        await step(
          t,
          'should ignore file in path but outside of watchPath',
          async (_) => {
            await Deno.writeTextFile(BASE + '/public/a.js', 'data2');
            await sleep(500);
            expect(events).toEqual([]);
            events = [];
          },
        );
        await close(websocket);
        await close(process);
      },
    );
  });
  await Deno.remove(BASE, { recursive: true });
});
