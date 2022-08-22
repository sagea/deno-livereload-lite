import { expect, fn, step } from '../../testUtils/mod.ts';
import { addResponseHeaders } from '../addResponseHeaders.ts';
import { Context } from '../Context.ts';

Deno.test('addResponseHeaders', async (t) => {
  await step(t, 'should add response headers', async (t) => {
    await step(t, 'should not add headers if none are provided', () => {
      const mockCtx = new Context({
        request: new Request('http://localhost:9999/woah.js'),
        respondWith: fn(async () => {}),
      }, (a) => a);
      const mockNext = fn(() => {});
      addResponseHeaders({})(mockCtx, mockNext);
      expect(Array.from(mockCtx.responseHeaders).length).toEqual(0);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    await step(t, 'should not add headers that are provided', () => {
      const mockCtx = new Context({
        request: new Request('http://localhost:9999/woah.js'),
        respondWith: fn(async () => {}),
      }, (a) => a);
      const mockNext = fn(() => {});
      addResponseHeaders({ a: 'hehe', b: 'woahdude' })(
        mockCtx,
        mockNext,
      );

      expect(Array.from(mockCtx.responseHeaders).length).toEqual(2);
      expect(mockCtx.responseHeaders.get('a')).toEqual('hehe');
      expect(mockCtx.responseHeaders.get('b')).toEqual('woahdude');
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    await step(
      t,
      'should not keep existing headers and overwrite if there are conflicts',
      () => {
        const mockCtx = new Context({
          request: new Request('http://localhost:9999/woah.js'),
          respondWith: fn(async () => {}),
        }, (a) => a);
        mockCtx.responseHeaders.append('a', 'bro');
        mockCtx.responseHeaders.append('c', 'cool');
        const mockNext = fn(() => {});
        addResponseHeaders({ a: 'hehe', b: 'woahdude' })(
          mockCtx,
          mockNext,
        );
        expect(Array.from(mockCtx.responseHeaders).length).toEqual(3);
        expect(mockCtx.responseHeaders.get('a')).toEqual('hehe');
        expect(mockCtx.responseHeaders.get('b')).toEqual('woahdude');
        expect(mockCtx.responseHeaders.get('c')).toEqual('cool');
        expect(mockNext).toHaveBeenCalledTimes(1);
      },
    );
  });
});
