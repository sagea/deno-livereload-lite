import { expect, fn, mock, step } from '../../testUtils/mod.ts';
import { Context, ResponseHook } from '../Context.ts';

Deno.test('Context', async (t) => {
  await step(t, 'filePath property should be relative', () => {
    const instance = new Context({
      request: { url: 'http://localhost:8080/woahdude/haha.js?woah=true' },
    } as any, (t) => t);
    expect(instance.filePath).toEqual('/woahdude/haha.js');
  });
  await step(
    t,
    'headers property should return original request headers',
    () => {
      const instance = new Context({
        request: {
          url: 'http://localhost:8080/woahdude/haha.js?woah=true',
          headers: new Headers({ a: 'a' }),
        },
      } as any, (t) => t);
      expect(instance.headers).toBeInstanceOf(Headers);
      expect([...instance.headers]).toEqual([['a', 'a']]);
    },
  );
  await step(t, 'respondWith method', async (t) => {
    await step(
      t,
      'should call sync responseHook and send what it returns',
      async (t) => {
        const mockReturnResponse = new Response('hello');
        const mockGivenResponse = new Response('haha');
        const responseHook = fn<ResponseHook>(() => mockReturnResponse);
        const requestEvent = {
          request: {
            url: 'http://localhost:8080/woahdude/haha.js?woah=true',
            headers: new Headers({ a: 'a' }),
          },
          respondWith: mock.fn(),
        } as any as Deno.RequestEvent;

        const ctx = new Context(requestEvent, responseHook);
        await ctx.respondWith(mockGivenResponse);

        expect(requestEvent.respondWith).toHaveBeenCalledWith(
          mockReturnResponse,
        );
        expect(requestEvent.respondWith).toHaveBeenCalledTimes(1);

        await step(
          t,
          'response hook should be passed in response and context',
          () => {
            expect(responseHook).toHaveBeenCalledWith(mockGivenResponse, ctx);
            expect(responseHook).toHaveBeenCalledTimes(1);
          },
        );
      },
    );

    await step(
      t,
      'should call async responseHook and send what it returns',
      async (t) => {
        const mockReturnResponse = new Response('hello');
        const mockGivenResponse = new Response('haha');
        const responseHook = fn<ResponseHook>(async () =>
          await mockReturnResponse
        );
        const requestEvent = {
          request: {
            url: 'http://localhost:8080/woahdude/haha.js?woah=true',
            headers: new Headers({ a: 'a' }),
          },
          respondWith: mock.fn(),
        } as any as Deno.RequestEvent;

        const ctx = new Context(requestEvent, responseHook);
        await ctx.respondWith(mockGivenResponse);

        expect(requestEvent.respondWith).toHaveBeenCalledWith(
          mockReturnResponse,
        );
        expect(requestEvent.respondWith).toHaveBeenCalledTimes(1);

        await step(
          t,
          'response hook should be passed in response and context',
          () => {
            expect(responseHook).toHaveBeenCalledWith(mockGivenResponse, ctx);
            expect(responseHook).toHaveBeenCalledTimes(1);
          },
        );
      },
    );
  });
  await step(
    t,
    'workflow: responseHeaders should add headers to response',
    async (_) => {
      const requestEvent = {
        request: {
          url: 'http://localhost:8080/woahdude/haha.js?woah=true',
          headers: new Headers({ a: 'a' }),
        },
        respondWith: mock.fn(),
      } as any as Deno.RequestEvent;
      const response = new Response('huh');
      const ctx = new Context(requestEvent, (t) => t);
      ctx.responseHeaders.set('woah', 'bro');
      ctx.responseHeaders.set('hehe', 'haha');
      await ctx.respondWith(response);
      expect(requestEvent.respondWith).toHaveBeenCalledTimes(1);
      const sentResponse = mock.calls(requestEvent.respondWith)[0]
        .args[0] as Response;
      expect(sentResponse.headers.get('woah')).toEqual('bro');
      expect(sentResponse.headers.get('hehe')).toEqual('haha');
    },
  );
});
