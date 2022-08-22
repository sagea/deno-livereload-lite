import { expect, step, fn } from '../src/testUtils/mod.ts';
import { ensureDir } from 'https://deno.land/std@0.152.0/fs/mod.ts';
import { close, startServer, TestFileManager, sleep } from './utils.ts';

const mockLocation = () => {
  return {
    hash: "",
    host: "localhost:9999",
    hostname: "localhost",
    href: "http://localhost:9999/",
    origin: "http://localhost:9999",
    pathname: "/",
    port: "9999",
    protocol: "http:",
    reload: fn(() => {}),
    replace: fn(() => {}),
    search: "",
    toString: () => 'http://localhost:9999/',
  }
}
Deno.test('06-livereload-client', async (t) => {
  await ensureDir('./e2e/test-artifacts');
  const tfm = new TestFileManager();
  await tfm.start();
  await tfm.add({
    './watchfolder/awesome/foo.js': 'awesome foo.js content',
    './nowatchfolder/bro/haha.js': 'bro haha.js content',
  });
  await step(t, 'should reload the window whenever a file changes', async t => {
    const process = await startServer({
      port: 9999,
      path: tfm.basePath + 'watchfolder',
    }, []);

    await step(t, '', async _ => {
      const pre = await fetch('http://localhost:9999/livereload/client.js');
      const content = await pre.text();
      const intervalIds: number[] = [];
      const websocketRefs: WebSocket[] = [];
      const window = {
        location: mockLocation(),
        setInterval: (a: any, b: any) => {
          const intervalId = setInterval(a, b);
          intervalIds.push(intervalId);
          return intervalId;
        },
        WebSocket: class extends WebSocket {
          constructor(wsUrl: string) {
            super(wsUrl);
            websocketRefs.push(this);
          }
        }
      }
      
      eval(content);
      
      await sleep(2000);
      await tfm.addFile('./watchfolder/awesome/foo.js', 'data2');
      await sleep(500);
      expect(window.location.reload).toHaveBeenCalled();
      await sleep(200);
      for (const intervalId of intervalIds) {
        clearInterval(intervalId);
      }
      await sleep(500);
      for (const websocketRef of websocketRefs) {
        await close(websocketRef);
      }
      await sleep(500);
    })
    await close(process);
  });
  await step(t, 'should attempt to reconnect if the server restarts', async t => {
    await step(t, '', async _ => {
      const serverProcess1 = await startServer({
        port: 9999,
        path: tfm.basePath + 'watchfolder',
      }, []);

      const pre = await fetch('http://localhost:9999/livereload/client.js');
      const content = await pre.text();
      const intervalIds: number[] = [];
      const websocketRefs: WebSocket[] = [];
      const window = {
        location: mockLocation(),
        setInterval: (a: any, b: any) => {
          const intervalId = setInterval(a, b);
          intervalIds.push(intervalId);
          return intervalId;
        },
        WebSocket: class extends WebSocket {
          constructor(wsUrl: string) {
            super(wsUrl);
            websocketRefs.push(this);
          }
        }
      }
      
      eval(content);
      
      await sleep(2000);
      expect(websocketRefs.length).toEqual(1);
      await close(serverProcess1)

      await sleep(2000);
      
      const serverProcess2 = await startServer({
        port: 9999,
        path: tfm.basePath + 'watchfolder',
      }, []);
      await sleep(2000);
      expect(websocketRefs.length).toBeGreaterThan(1);
      await tfm.addFile('./watchfolder/awesome/foo.js', 'data2');
      await sleep(500);
      expect(window.location.reload).toHaveBeenCalled();
      await sleep(200);
      for (const intervalId of intervalIds) {
        clearInterval(intervalId);
      }
      await sleep(500);
      for (const websocketRef of websocketRefs) {
        await close(websocketRef);
      }
      await sleep(500);
      await close(serverProcess2);
    })
  });
  await tfm.end();
});
