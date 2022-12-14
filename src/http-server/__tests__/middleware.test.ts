import { expect, fn, step } from '../../testUtils/mod.ts';
import { BaseMiddleware, middlewareRunner } from '../middleware.ts';
import { Context } from '../Context.ts';
const mockContext = () => {
  return new Context({
    request: new Request('http://localhost:9999/woah.js'),
    respondWith: fn(async () => {}),
  }, (a) => a);
};
Deno.test('middleware runner', async (t) => {
  await step(
    t,
    'not calling next function should ignore subsequent middleware',
    async () => {
      const middleware1 = fn<BaseMiddleware>(() => {});
      const middleware2 = fn<BaseMiddleware>(() => {});
      await middlewareRunner([middleware1, middleware2], mockContext());
      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).not.toHaveBeenCalled();
    },
  );

  await step(
    t,
    'calling next function should trigger next middleware',
    async () => {
      const middleware1 = fn<BaseMiddleware>((_, next) => {
        next();
      });
      const middleware2 = fn<BaseMiddleware>(() => {});
      await middlewareRunner([middleware1, middleware2], mockContext());
      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).toHaveBeenCalled();
    },
  );

  await step(
    t,
    'workflow: calling next("router") should skip to the next middleware in parent list and ignore the rest',
    async (_) => {
      const a = fn<BaseMiddleware>((_, next) => next());
      const b = fn<BaseMiddleware>((_, next) => next('router'));
      const c = fn<BaseMiddleware>(() => {});
      const d = fn<BaseMiddleware>((_, next) => {
        next();
      });
      const e = fn<BaseMiddleware>((_, next) => {
        next();
      });
      const f = fn<BaseMiddleware>((_, next) => {
        next();
      });
      await middlewareRunner([
        a,
        [b, c],
        [d, [e, f]],
      ], mockContext());
      expect(a).toHaveBeenCalled();
      expect(b).toHaveBeenCalled();
      expect(c).not.toHaveBeenCalled();
      expect(d).toHaveBeenCalled();
      expect(e).toHaveBeenCalled();
      expect(f).toHaveBeenCalled();
    },
  );
});
