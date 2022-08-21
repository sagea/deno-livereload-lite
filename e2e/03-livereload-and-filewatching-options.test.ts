import { step, expect } from '../src/testUtils/mod.ts';
import { ensureDir } from "https://deno.land/std@0.152.0/fs/mod.ts";
import { TestFileManager, sleep, startServer, close } from './utils.ts';

Deno.test('03-livereload-and-filewatching-options', async t => {
  await ensureDir('./e2e/test-artifacts');
  await step(t, 'should watch for file changes based on path', async t => {
    const tfm = new TestFileManager();
    await tfm.start();
    await step(t, 'create files', async () => {
      await tfm.add({
        './watchfolder/awesome/foo.js': 'data',
        './nowatchfolder/bro/haha.js': 'data',
      })
    })
    await step(t, 'should accept websocket connections and fire change event', async t => {
      const process = await startServer({
        port: 9999,
        path: tfm.basePath + 'watchfolder',
      });

      const websocket = new WebSocket("ws://localhost:9999/livereload/websocket");
      
      let events: any[] = [];
      websocket.onmessage = (e) => events.push(e.data);
      await sleep(500);
      await step(t, 'update file', async t => {
        await tfm.addFile('./watchfolder/awesome/foo.js', 'data2');
        await sleep(500);
        expect(events).toEqual(['change-detected']);
        events = [];
      })
      await step(t, 'add new file', async t => {
        await tfm.addFile('./watchfolder/awesome/newfile.js', 'data');
        await sleep(500);
        expect(events).toEqual(['change-detected']);
        events = [];
      });
      await step(t, 'delete file', async t => {
        await tfm.deleteFile('./watchfolder/awesome/newfile.js');
        await sleep(500);
        expect(events).toEqual(['change-detected']);
        events = [];
      });
      await step(t, 'update non watched file', async t => {
        await tfm.deleteFile('./nowatchfolder/bro/haha.js');
        await sleep(500);
        expect(events).toEqual([]);
        events = [];
      });
      await close(websocket);
      await close(process);
    });
    await step(t, 'should be able to define a different watch path', async t => {
      const process = await startServer({
        port: 9999,
        path: tfm.basePath + 'watchfolder',
        watchPath: tfm.basePath + 'watchfolder/awesome',
      });

      const websocket = new WebSocket("ws://localhost:9999/livereload/websocket");
      let events: any[] = [];
      websocket.onmessage = (e) => events.push(e.data);
      await sleep(500);
      await step(t, 'should watch for changes inside of custom watchPath', async t => {
        await tfm.addFile('./watchfolder/awesome/foo.js', 'data2');
        await sleep(500);
        expect(events).toEqual(['change-detected']);
        events = [];
      })
      await step(t, 'should ignore file in path but outside of watchPath', async t => {
        await tfm.addFile('./watchfolder/woah.js', 'data');
        await sleep(500);
        expect(events).toEqual([]);
        events = [];
      });
      await close(websocket)
      await close(process)
    })
    await tfm.end();
  })
  await step(t, 'should serve a livereload client script on /livereload/client', async t => {
    const tfm = new TestFileManager();
    await tfm.start();
    await step(t, 'create files', async () => {
      await tfm.add({
        './watchfolder/awesome/foo.js': 'data',
        './nowatchfolder/bro/haha.js': 'data',
      })
    })
    await step(t, 'action', async t => {
      const process = await startServer({
        port: 9999,
        path: tfm.basePath + 'watchfolder',
        watchPath: tfm.basePath + 'watchfolder/awesome',
      });

      const pre = await fetch('http://localhost:9999/livereload/client.js');
      const text = await pre.text();
      expect(pre.status).toEqual(200);
      expect(text.length).toBeGreaterThan(10);
      await close(process);
    })
    await tfm.end();
  })
  // await Deno.remove('./e2e/test-artifacts', { recursive: true });
});
