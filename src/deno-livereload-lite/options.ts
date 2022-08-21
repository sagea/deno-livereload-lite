import { Methods, Middleware, ResponseHook } from '../http-server/mod.ts';

export interface CustomRouteOption {
  methods?: Methods | Methods[];
  path: string;
  middleware: Middleware;
}

export interface Options {
  path: string;
  port: number;
  watchEnabled: boolean;
  watchPath: string;
  watchDebounce: number;
  responseHook: ResponseHook;
  middleware: Middleware[];
  customRoutes: CustomRouteOption[];
  globalResponseHeaders: Record<string, string>;
  contentTypeOverrides: Record<string, string>;
}

export const processOptions = (providedOptions: Partial<Options>) => {
  const path = providedOptions.path || '.';
  const port = providedOptions.port || 8080;
  const watchEnabled = providedOptions.watchEnabled || true;
  const watchPath = providedOptions.watchPath || path;
  const watchDebounce = providedOptions.watchDebounce || 200;
  const responseHook = providedOptions.responseHook || ((response) => response);
  const middleware = providedOptions.middleware || [];
  const globalResponseHeaders = providedOptions.globalResponseHeaders || {};
  const contentTypeOverrides = providedOptions.contentTypeOverrides || {};
  const customRoutes = providedOptions.customRoutes || [];
  return {
    path,
    port,
    watchEnabled,
    watchPath,
    watchDebounce,
    responseHook,
    middleware,
    globalResponseHeaders,
    contentTypeOverrides,
    customRoutes,
  } as Options;
};
