import { ResponseHook, Context } from './Context.ts';
import { Middleware, middlewareRunner } from "./middleware.ts";
import { url, method } from "./route.ts";

export interface HttpServerOptions {
  port: number;
  responseHook: ResponseHook;
}

export class HttpServer {
  server: Deno.Listener | undefined;
  middleware: Middleware[] = [];
  started = false;
  constructor(
    public options: HttpServerOptions
  ) {}
  async start() {
    this.started = true;
    this.server = Deno.listen({ port: this.options.port });
    console.log(`File server running on http://localhost:${this.options.port}/`);
    for await (const conn of this.server) {
      this.handleHttp(conn).catch(console.error);
    }
  }
  async handleHttp(conn: Deno.Conn) {
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
      const context = new Context(
        requestEvent,
        this.options.responseHook
      );
      
      middlewareRunner(this.middleware, context);
    }
  }
  close() {
    this.server?.close();
  }
  use(...middleware: Middleware[]) {
    if (this.started) {
      throw new Error('Unable to add middleware after http server has started');
    }
    this.middleware.push(...middleware);
  }
  get(path: string, ...middleware: Middleware[]) {
    this.use([ method('get'), url(path), ...middleware ])
  }
  post(path: string, ...middleware: Middleware[]) {
    this.use([ method('post'), url(path), ...middleware ])
  }
  put(path: string, ...middleware: Middleware[]) {
    this.use([ method('put'), url(path), ...middleware ])
  }
  patch(path: string, ...middleware: Middleware[]) {
    this.use([ method('patch'), url(path), ...middleware ])
  }
  delete(path: string, ...middleware: Middleware[]) {
    this.use([ method('delete'), url(path), ...middleware ])
  }
}