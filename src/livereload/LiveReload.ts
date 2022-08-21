import { Middleware } from '../http-server/mod.ts';
import { WebsocketHandler } from '../websocket/mod.ts';
import { FileWatcher } from '../file-watcher/mod.ts';
import { clientMiddlewareCreator } from './clientMiddlewareCreator.ts';
import { registerWebsocket } from './registerWebsocket.ts';

export interface LiveReloadOptions {
  path: string;
  delay: number;
}

export class LiveReload {
  clientMiddleware: Middleware;
  socketMiddleware: Middleware;
  websocketHandler: WebsocketHandler;
  watcher: FileWatcher | undefined;
  constructor(
    public options: LiveReloadOptions,
  ) {
    this.websocketHandler = new WebsocketHandler();
    this.clientMiddleware = clientMiddlewareCreator();
    this.socketMiddleware = registerWebsocket(this.websocketHandler);
  }
  start() {
    const handler = () => {
      console.log('files changed');
      this.websocketHandler.sendToAll('change-detected');
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
    this.websocketHandler.close();
  }
}
