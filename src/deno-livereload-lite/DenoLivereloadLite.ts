import {
  serveStatic,
  addResponseHeaders,
  HttpServer,
  contentTypeMappings,
  method,
  url,
} from "../http-server/mod.ts";
import { LiveReload } from '../livereload/mod.ts';
import { Options, processOptions } from './options.ts';

export class DenoLivereloadLite {
  liveReload: LiveReload;
  httpServer: HttpServer;
  options: ReturnType<typeof processOptions>;
  constructor(
    providedOptions: Partial<Options> = {}
  ) {
    this.options = processOptions(providedOptions);
    this.liveReload = new LiveReload({
      path: this.options.watchPath,
      delay: this.options.watchDebounce,
    });

    this.httpServer = new HttpServer({
      port: this.options.port,
      responseHook: this.options.responseHook,
    });

    this.httpServer.use(
      this.liveReload.clientMiddleware,
      this.liveReload.socketMiddleware,
      addResponseHeaders(this.options.globalResponseHeaders),
    );

    this.httpServer.use(...this.options.middleware);

    for (const customRoute of this.options.customRoutes) {
      const middleware = Array.isArray(customRoute.middleware)
        ? customRoute.middleware
        : [customRoute.middleware];
      if (customRoute.methods) {
        this.httpServer.use([
          method(customRoute.methods),
          url(customRoute.path),
          ...middleware,
        ])
      } else {
        this.httpServer.use([
          url(customRoute.path),
          ...middleware,
        ])
      }
    }

    this.httpServer.use(
      serveStatic(this.options.path, {
        ...contentTypeMappings,
        ...this.options.contentTypeOverrides
      })
    )
  }
  async start() {
    this.liveReload.start();
    await this.httpServer.start();
  }
  close() {
    this.liveReload?.close();
    this.httpServer?.close();
  }
}
