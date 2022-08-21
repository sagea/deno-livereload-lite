import { expect, step } from '../src/testUtils/mod.ts';
import { ensureDir } from 'https://deno.land/std@0.152.0/fs/mod.ts';
import { close, startServer, TestFileManager } from './utils.ts';

Deno.test('01-static-content-serve', async (t) => {
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
    });

    await step(t, 'should return static content', async _ => {
      const pre = await fetch('http://localhost:9999/awesome/foo.js');
      expect(await pre.text()).toEqual('awesome foo.js content');
    });

    await step(t, 'should return 404 if file does not exit', async _ => {
      const pre = await fetch(
        'http://localhost:9999/awesome/does-not-exist.js',
      );
      await pre.blob();
      expect(pre.status).toEqual(404);
    });
    await step(
      t,
      'should return 404 if file from different path is watched',
      async _ => {
        const pre = await fetch('http://localhost:9999/bro/haha.js');
        await pre.blob();
        expect(pre.status).toEqual(404);
      },
    );
    await close(process);
    await tfm.end();
  });
});
