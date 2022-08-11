import { ResponseHook, Context } from './Context.ts';
import { Middleware, middlewareRunner } from "./middleware.ts";

export interface HttpServerOptions {
  port: number;
  responseHook: ResponseHook;
}

export class HttpServer {
  server: Deno.Listener | undefined;
  middleware: Middleware[] = [];
  constructor(
    public options: HttpServerOptions
  ) {}
  async start() {
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
  addMiddleware(...middleware: Middleware[]) {
    this.middleware.push(...middleware);
  }
  close() {
    this.server?.close();
  }
}