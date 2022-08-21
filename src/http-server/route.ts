import { Middleware } from './middleware.ts';
import { pathMatcher } from './util.ts'
export type IncludeLowercase<T extends string> = `${T | Lowercase<T>}`;
export type Methods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const method = (
  methods: IncludeLowercase<Methods> | IncludeLowercase<Methods>[],
): Middleware => (ctx, next) => {
  const requestMethod = ctx.method.toUpperCase();
  if (Array.isArray(methods)) {
    if ((methods as string[]).includes(requestMethod)) {
      return next();
    }
  } else if (requestMethod === methods.toUpperCase()) {
    return next()
  }
  return next('router');
}

export const url = (url: string): Middleware => {
  const matcher = pathMatcher(url)
  return (ctx, next) => {
    const match = matcher(ctx.filePath);
    if (!match) return next('router');
    ctx.query = match;
    return next();
  }
}
