import { expect, step } from '../../testUtils/mod.ts';
import { pathMatcher } from '../util.ts';

Deno.test('pathMatcher', async (t) => {
  await step(t, 'should match a url', async (t) => {
    const matcher = pathMatcher('/foo/haha/hehe');
    await step(t, 'should return false if not matching', () => {
      expect(matcher('')).toEqual(false);
      expect(matcher('/')).toEqual(false);
      expect(matcher('/foo')).toEqual(false);
      expect(matcher('/foo/haha')).toEqual(false);
      expect(matcher('/foo/haha/')).toEqual(false);
    });
    await step(
      t,
      'should return an empty object when dynamic params aren`t defined',
      () => {
        expect(matcher('/foo/haha/hehe')).toEqual({});
      },
    );
  });
  await step(t, 'should accept dynamic params', _ => {
    const matcher = pathMatcher('/foo/:bro/:woah');
    expect(matcher('/foo/a/b')).toEqual({ bro: 'a', woah: 'b' });
    expect(matcher('/foo/a')).toEqual(false);
    expect(matcher('/foo/a/')).toEqual(false);
    expect(matcher('/foo//b')).toEqual(false);
  });

  await step(t, 'should accept *', _ => {
    const matcher = pathMatcher('/foo/*');
    expect(matcher('/foo/a/b')).toEqual({});
    expect(matcher('/foo/a')).toEqual({});
    expect(matcher('/foo/a/')).toEqual({});
    expect(matcher('/foo//b')).toEqual({});
    expect(matcher('/foo/')).toEqual({});
    expect(matcher('/foo')).toEqual(false);
  });
});
