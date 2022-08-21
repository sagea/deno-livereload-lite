import { Middleware, url, method } from "../http-server/mod.ts";
export const clientMiddlewareCreator = (): Middleware => {
  return [
    method('get'),
    url('/livereload/client.js'),
    async (ctx) => {
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
    
  ]
}