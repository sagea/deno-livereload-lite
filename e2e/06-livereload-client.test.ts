import { expect, fn, step } from '../src/testUtils/mod.ts';
import { copy } from 'https://deno.land/std@0.152.0/fs/mod.ts';
import { close, sleep, startServer } from './utils.ts';

const mockLocation = () => {
  return {
    hash: '',
    host: 'localhost:9999',
    hostname: 'localhost',
    href: 'http://localhost:9999/',
    origin: 'http://localhost:9999',
    pathname: '/',
    port: '9999',
    protocol: 'http:',
    reload: fn(() => {}),
    replace: fn(() => {}),
    search: '',
    toString: () => 'http://localhost:9999/',
  };
};
Deno.test('06-livereload-client', async (t) => {
  const BASE = `./e2e/test-artifacts/${Math.random()}`;
  await copy(`./e2e/test-artifacts/base`, BASE);
  await step(
    t,
    'should reload the window whenever a file changes',
    async (t) => {
      const process = await startServer({
        port: 9999,
        path: BASE + '/public',
      }, []);

      await step(t, '', async (_) => {
        const pre = await fetch('http://localhost:9999/livereload/client.js');
        const content = await pre.text();
        const intervalIds: number[] = [];
        const websocketRefs: WebSocket[] = [];
        const window = {
          location: mockLocation(),
          setInterval: (...args: Parameters<typeof setInterval>) => {
            const intervalId = setInterval(...args);
            intervalIds.push(intervalId);
            return intervalId;
          },
          WebSocket: class extends WebSocket {
            constructor(wsUrl: string) {
              super(wsUrl);
              websocketRefs.push(this);
            }
          },
        };

        eval(content);

        await sleep(2000);
        await Deno.writeTextFile(
          BASE + '/public/deep/deep-test.js',
          Math.random().toString(),
        );
        await sleep(500);
        expect(window.location.reload).toHaveBeenCalled();
        await sleep(200);
        for (const intervalId of intervalIds) {
          clearInterval(intervalId);
        }
        await sleep(500);
        await close(...websocketRefs);
        await sleep(500);
      });
      await close(process);
    },
  );
  await step(
    t,
    'should attempt to reconnect if the server restarts',
    async (t) => {
      await step(t, '', async (_) => {
        const serverProcess1 = await startServer({
          port: 9999,
          path: BASE + '/public',
        }, []);

        const pre = await fetch('http://localhost:9999/livereload/client.js');
        const content = await pre.text();
        const intervalIds: number[] = [];
        const websocketRefs: WebSocket[] = [];
        const window = {
          location: mockLocation(),
          setInterval: (...args: Parameters<typeof setInterval>) => {
            const intervalId = setInterval(...args);
            intervalIds.push(intervalId);
            return intervalId;
          },
          WebSocket: class extends WebSocket {
            constructor(wsUrl: string) {
              super(wsUrl);
              websocketRefs.push(this);
            }
          },
        };

        eval(content);

        await sleep(2000);
        expect(websocketRefs.length).toEqual(1);
        await close(serverProcess1);

        await sleep(2000);

        const serverProcess2 = await startServer({
          port: 9999,
          path: BASE + '/public',
        }, []);
        await sleep(2000);
        expect(websocketRefs.length).toBeGreaterThan(1);
        await Deno.writeTextFile(
          BASE + '/public/deep/deep-test.js',
          Math.random().toString(),
        );
        await sleep(500);
        expect(window.location.reload).toHaveBeenCalled();
        await sleep(200);
        for (const intervalId of intervalIds) {
          clearInterval(intervalId);
        }
        await sleep(500);
        await close(...websocketRefs);
        await sleep(500);
        await close(serverProcess2);
      });
    },
  );
  await Deno.remove(BASE, { recursive: true });
});
