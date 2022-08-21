import { expect, step } from '../src/testUtils/mod.ts';
import { ensureDir } from 'https://deno.land/std@0.152.0/fs/mod.ts';
import { close, startServer, TestFileManager } from './utils.ts';

Deno.test('05-responseHook-option', async (t) => {
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
    }, ['custom-response-basic-hook']);

    await step(
      t,
      'should allow for a modification of the Response before sending to the client',
      async () => {
        const pre = await fetch('http://localhost:9999/awesome/foo.js');
        const text = await pre.text();
        expect(text.endsWith('add-ending-to-hook')).toEqual(true);
      },
    );
    await close(process);
    await tfm.end();
  });
});
