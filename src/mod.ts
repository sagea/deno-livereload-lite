import { contentTypeMappings } from './content-type-mappings.ts';
import { HttpServer } from './HttpServer.ts';
import { Middleware } from "./middleware.ts";
import { ResponseHook } from './Context.ts';
import { serveStatic } from './middleware/serveStatic.ts';
import { LiveReload } from './livereload.ts';
import { addResponseHeaders } from './middleware/addResponseHeaders.ts';

export interface Options {
  path: string;
  port: number;
  watchEnabled: boolean;
  watchPath: string;
  watchDebounce: number;
  responseHook: ResponseHook;
  middleware: Middleware[];
  globalResponseHeaders: Record<string, string>;
  contentTypeOverrides: Record<string, string>;
}

const processOptions = (providedOptions: Partial<Options>) => {
  const path = providedOptions.path || '.';
  const port = providedOptions.port || 8080;
  const watchEnabled = providedOptions.watchEnabled || true;
  const watchPath = providedOptions.watchPath || path;
  const watchDebounce = providedOptions.watchDebounce || 200;
  const responseHook = providedOptions.responseHook || ((response) => response);
  const middleware = providedOptions.middleware || [];
  const globalResponseHeaders = providedOptions.globalResponseHeaders || {};
  const contentTypeOverrides = providedOptions.contentTypeOverrides || {};
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
  } as const;
}

export class DenoLivereloadLite {
  liveReload: LiveReload | undefined;
  httpServer: HttpServer | undefined;
  options: ReturnType<typeof processOptions>;
  constructor(
    providedOptions: Partial<Options> = {}
  ) {
    this.options = processOptions(providedOptions);
  }
  async start() {
    this.liveReload = new LiveReload({
      path: this.options.watchPath,
      delay: this.options.watchDebounce,
    })
    this.httpServer = new HttpServer({
      port: this.options.port,
      responseHook: this.options.responseHook,
    });
  
    this.httpServer.addMiddleware(
      this.liveReload.clientMiddleware,
      this.liveReload.socketMiddleware,
      addResponseHeaders(this.options.globalResponseHeaders),
      ...this.options.middleware,
      serveStatic(this.options.path, { ...contentTypeMappings, ...this.options.contentTypeOverrides }),
    )
    this.liveReload.start();
    await this.httpServer.start();
  }
  close() {
    this.liveReload?.close();
    this.httpServer?.close();
  }
}

// const instance = new DenoLivereloadLite({
//   path: './public',
// });

// instance.start()

