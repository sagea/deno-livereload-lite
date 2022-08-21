import { Middleware, url, method } from "../http-server/mod.ts";
import { WebsocketHandler } from "../websocket/mod.ts";

export const registerWebsocket = (websocketHandler: WebsocketHandler): Middleware => {
  return [
    method('get'),
    url('/livereload/websocket'),
    (ctx, next) => {
      if (ctx.headers.get('upgrade') !== 'websocket') return next();
      websocketHandler.handleRequest(ctx);
    }
  ]
}
