import { Context } from './Context.ts';

export type NextFunction = (value?: 'router') => void;
export type BaseMiddleware = (ctx: Context, next: NextFunction) => void;
export type Middleware = BaseMiddleware | Middleware[];

export const middlewareRunner = async (
  middlewareList: Middleware[],
  ctx: Context,
) => {
  for (const middleware of middlewareList) {
    if (Array.isArray(middleware)) {
      const result = await middlewareRunner(middleware, ctx);
      if (result === 'router') {
        continue;
      } else {
        return;
      }
    } else {
      let nextCalled = false;
      let nextValue: undefined | 'router';
      const next: NextFunction = (value) => {
        nextCalled = true;
        nextValue = value;
      };
      await middleware(ctx, next);
      if (nextCalled && nextValue === 'router') {
        return 'router';
      }
      if (!nextCalled) return;
    }
  }
};
