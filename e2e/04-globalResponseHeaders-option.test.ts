import { expect, step } from '../src/testUtils/mod.ts';
import { ensureDir } from 'https://deno.land/std@0.152.0/fs/mod.ts';
import { close, startServer, TestFileManager } from './utils.ts';

Deno.test('04-globalResponseHeaders-option', async (t) => {
  await ensureDir('./e2e/test-artifacts');
  await step(t, 'should serve static content', async (t) => {
    const tfm = new TestFileManager();
    await tfm.start();
    await tfm.add({
      './watchfolder/awesome/foo.js': 'awesome foo.js content',
      './nowatchfolder/bro/haha.js': 'bro haha.js content',
    });

    const process = await startServer({
      port: 9999,
      path: tfm.basePath + 'watchfolder',
      globalResponseHeaders: { foo: 'bar', a: 'b' },
    });

    await step(t, 'should add global headers to all requests', async (t) => {
      await step(t, 'existing static content', async _ => {
        const pre = await fetch('http://localhost:9999/awesome/foo.js');
        expect(await pre.text()).toEqual('awesome foo.js content');
        expect(pre.headers.get('foo')).toEqual('bar');
        expect(pre.headers.get('a')).toEqual('b');
      });

      await step(t, 'not found content', async _ => {
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
    await tfm.end();
  });
});
