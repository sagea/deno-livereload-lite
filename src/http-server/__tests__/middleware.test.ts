import { expect, fn, step } from '../../testUtils/mod.ts';
import { BaseMiddleware, middlewareRunner } from '../middleware.ts';

Deno.test('middleware runner', async (t) => {
  await step(
    t,
    'not calling next function should ignore subsequent middleware',
    async () => {
      const middleware1 = fn<BaseMiddleware>(() => {});
      const middleware2 = fn<BaseMiddleware>(() => {});
      await middlewareRunner([middleware1, middleware2], {} as any);
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
      await middlewareRunner([middleware1, middleware2], {} as any);
      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).toHaveBeenCalled();
    },
  );

  await step(
    t,
    'workflow: calling next("router") should skip to the next middleware in parent list and ignore the rest',
    async (t) => {
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
      ], {} as any);
      expect(a).toHaveBeenCalled();
      expect(b).toHaveBeenCalled();
      expect(c).not.toHaveBeenCalled();
      expect(d).toHaveBeenCalled();
      expect(e).toHaveBeenCalled();
      expect(f).toHaveBeenCalled();
    },
  );
});
