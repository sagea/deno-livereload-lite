import { Middleware } from "./middleware.ts";
import { WebSocketServer } from "./websocket.ts";
import { FileWatcher } from './watcher.ts';

export const clientMiddleware: Middleware = async (ctx, next) => {
  if (ctx.filePath !== '/livereload/client.js') return next();
  const text = `
    (() => {
      'use strict';
      const url = new URL(window.location)
      const wsurl = 'ws://' + url.host + '/livereload/websocket';
      let ws;
      const connect = () => {
        console.log('Attempting to connect to livereload websocket');
        ws = new WebSocket(wsurl);
        ws.addEventListener('open', event => {
          console.log('Connected to livereload websocket');
        })
        ws.addEventListener('message', event => {
          if (event.data === 'change-detected') {
            window.location.reload(true)
          }
          console.log('event', event.data);
        })
        ws.addEventListener('error', event => {
          console.error('Unable to connect to livereload websocket', event);
        })
        ws.addEventListener('close', event => {
          console.log('livereload websocket closed', event);
        })
      }
      setInterval(() => {
        if (!ws || ws.readyState === WebSocket.CLOSED) {
          connect();
        }
      }, 500)
    })();
  `;
  await ctx.respondWith(new Response(text, { status: 200 }));
}

export const registerWebsocket = (websocketServer: WebSocketServer): Middleware => (ctx, next) => {
  if (ctx.filePath !== '/livereload/websocket') return next();
  if (ctx.headers.get('upgrade') !== 'websocket') return next();
  websocketServer.handleRequest(ctx);
}

export interface LiveReloadOptions {
  path: string;
  delay: number;
}

export class LiveReload {
  clientMiddleware: Middleware;
  socketMiddleware: Middleware;
  websocketServer: WebSocketServer;
  watcher: FileWatcher | undefined;
  constructor(
    public options: LiveReloadOptions,
  ) {
    this.websocketServer = new WebSocketServer();
    this.clientMiddleware = clientMiddleware;
    this.socketMiddleware = registerWebsocket(this.websocketServer);
  }
  watch() {
    const handler = () => {
      console.log('files changed');
      this.websocketServer.sendToAll('change-detected');
    };
    this.watcher = new FileWatcher(
      this.options.path,
      this.options.delay,
      handler,
    );
    this.watcher.start();
  }
  close() {
    this.watcher?.close();
    this.websocketServer.close();
  }
}
