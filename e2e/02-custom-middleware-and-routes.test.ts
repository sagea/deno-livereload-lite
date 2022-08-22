import { expect, step } from '../src/testUtils/mod.ts';
import { copy } from 'https://deno.land/std@0.152.0/fs/mod.ts';
import { close, startServer } from './utils.ts';

Deno.test('02-custom-middleware-and-routes', async (t) => {
  const BASE = `./e2e/test-artifacts/${Math.random()}`;
  await copy(`./e2e/test-artifacts/base`, BASE);
  await step(
    t,
    'should be able to define custom middleware an custom routes',
    async (t) => {
      await step(t, 'custom middleware', async (t) => {
        const process = await startServer({
          port: 9999,
          path: BASE + '/public',
        }, ['custom-middleware-add-response-header', 'custom-routes']);

        await step(t, '', async (_) => {
          const pre = await fetch('http://localhost:9999/a.js');
          await pre.text();

          expect(pre.headers.has('woah')).toEqual(true);
          expect(pre.headers.get('woah')).toEqual('bro');
        });
        await close(process);
      });
      await step(t, 'custom routes', async (t) => {
        const process = await startServer({
          port: 9999,
          path: BASE + '/public',
        }, ['custom-middleware-add-response-header', 'custom-routes']);
        await step(
          t,
          'custom route "/haha" alloed to have get and post',
          async (t) => {
            await step(t, 'get pass', async (_) => {
              const pre = await fetch('http://localhost:9999/haha');
              const result = await pre.text();
              expect(result).toEqual('haha');
              expect(pre.status).toEqual(200);
            });
            await step(t, 'post pass', async (_) => {
              const pre = await fetch('http://localhost:9999/haha', {
                method: 'post',
              });
              const result = await pre.text();
              expect(result).toEqual('haha');
              expect(pre.status).toEqual(200);
            });
            await step(t, 'delete ignored', async (_) => {
              const pre = await fetch('http://localhost:9999/haha', {
                method: 'delete',
              });
              await pre.blob();
              expect(pre.status).toEqual(404);
            });
            await step(t, 'put ignored', async (_) => {
              const pre = await fetch('http://localhost:9999/haha', {
                method: 'put',
              });
              await pre.blob();
              expect(pre.status).toEqual(404);
            });
            await step(t, 'patch ignored', async (_) => {
              const pre = await fetch('http://localhost:9999/haha', {
                method: 'patch',
              });
              await pre.blob();
              expect(pre.status).toEqual(404);
            });
          },
        );
        await step(
          t,
          'custom route can accept any method if no methods are found /any-method',
          async (t) => {
            await step(t, 'get pass', async (_) => {
              const pre = await fetch('http://localhost:9999/any-method');
              const result = await pre.text();
              expect(result).toEqual('bro');
              expect(pre.status).toEqual(200);
            });
            await step(t, 'post pass', async (_) => {
              const pre = await fetch('http://localhost:9999/any-method', {
                method: 'post',
              });
              const result = await pre.text();
              expect(result).toEqual('bro');
              expect(pre.status).toEqual(200);
            });
            await step(t, 'put pass', async (_) => {
              const pre = await fetch('http://localhost:9999/any-method', {
                method: 'put',
              });
              const result = await pre.text();
              expect(result).toEqual('bro');
              expect(pre.status).toEqual(200);
            });
            await step(t, 'patch pass', async (_) => {
              const pre = await fetch('http://localhost:9999/any-method', {
                method: 'patch',
              });
              const result = await pre.text();
              expect(result).toEqual('bro');
              expect(pre.status).toEqual(200);
            });
            await step(t, 'delete pass', async (_) => {
              const pre = await fetch('http://localhost:9999/any-method', {
                method: 'delete',
              });
              const result = await pre.text();
              expect(result).toEqual('bro');
              expect(pre.status).toEqual(200);
            });
          },
        );
        await close(process);
      });
    },
  );
  await Deno.remove(BASE, { recursive: true });
});
