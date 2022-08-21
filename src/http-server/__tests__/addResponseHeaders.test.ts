import { expect, fn, mock, step } from '../../testUtils/mod.ts';
import { addResponseHeaders } from '../addResponseHeaders.ts';

Deno.test('addResponseHeaders', async (t) => {
  await step(t, 'should add response headers', async (t) => {
    await step(t, 'should not add headers if none are provided', () => {
      const mockCtx = { responseHeaders: new Headers() };
      const mockNext = fn(() => {});
      addResponseHeaders({})(mockCtx as any, mockNext as any);
      expect(Array.from(mockCtx.responseHeaders).length).toEqual(0);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    await step(t, 'should not add headers that are provided', () => {
      const mockCtx = { responseHeaders: new Headers() };
      const mockNext = fn(() => {});
      addResponseHeaders({ a: 'hehe', b: 'woahdude' })(
        mockCtx as any,
        mockNext as any,
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
        const mockCtx = {
          responseHeaders: new Headers({ a: 'bro', c: 'cool' }),
        };
        const mockNext = fn(() => {});
        addResponseHeaders({ a: 'hehe', b: 'woahdude' })(
          mockCtx as any,
          mockNext as any,
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
