import { Options } from '../src/deno-livereload-lite/mod.ts';
export const runnerActions = {
  'custom-middleware-add-response-header': () => {
    return {
      middleware: [
        (ctx, next) => {
          ctx.responseHeaders.append('woah', 'bro');
          next();
        },
      ],
    } as Partial<Options>;
  },
  'custom-routes': () => {
    return {
      customRoutes: [
        {
          path: '/any-method',
          middleware: (ctx, next) => {
            ctx.respondWith(new Response('bro', { status: 200 }));
          },
        },
        {
          methods: ['GET', 'POST'],
          path: '/haha',
          middleware: (ctx, next) => {
            ctx.respondWith(new Response('haha', { status: 200 }));
          },
        },
      ],
    } as Partial<Options>;
  },
  'custom-response-basic-hook': () => {
    return {
      responseHook: async (response) => {
        const result = await response.text();
        return new Response(result + '\n\nadd-ending-to-hook', {
          headers: response.headers,
          status: response.status,
        });
      },
    } as Partial<Options>;
  },
} as const;
