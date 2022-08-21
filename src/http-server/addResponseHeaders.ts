import { BaseMiddleware } from "./middleware.ts";

export const addResponseHeaders = (defaults: Record<string, string>): BaseMiddleware => (ctx, next) => {
  for (const [key, value] of Object.entries(defaults)) {
    ctx.responseHeaders.set(key, value);
  }
  return next();
}
