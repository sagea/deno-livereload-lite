import { AssertionError } from 'https://deno.land/std@0.151.0/testing/asserts.ts';
import { expect, mock } from 'https://deno.land/x/expect@v0.2.10/mod.ts';
import { readLines } from 'https://deno.land/std@0.151.0/io/buffer.ts';

// todo: find a better place for this
const textFiles = new Map<string, Promise<string[]>>();
const getTextFile = async (path: string): Promise<string[]> => {
  if (!textFiles.has(path)) {
    const promise = Deno.open(new URL(path))
      .then(async (result) => {
        const list: string[] = [];
        for await (const line of readLines(result)) {
          list.push(line);
        }
        result.close();
        return list;
      });
    textFiles.set(path, promise);
  }
  return await textFiles.get(path) as string[];
};
const addLinesToAssertionError = async (
  origin: string,
  assertionError: AssertionError,
): Promise<AssertionError> => {
  try {
    const errorPath = assertionError.stack?.split('\n')
      .map((i) => i.trim())
      .filter((i) => Boolean(i))
      .filter((i) => i.startsWith('at'))
      .map((i) => i.replace(/^at\s+/g, ''))
      .find((i) => i.startsWith(import.meta.url));
    const found = /([0-9]+):([0-9]+)$/.exec(errorPath as string);
    const lineNumber = Number(found![1]);
    const charNumber = Number(found![2]);
    const file = await getTextFile(origin);
    const start = file.slice(lineNumber - 3, lineNumber);
    const end = file.slice(lineNumber, lineNumber + 2);
    const space = new Array(charNumber - 1).fill(' ').join('') + '^';
    const assertion = [...start, space, ...end].join('\n');
    assertionError.message += '\n' + assertion;
    return assertionError;
  } catch (_err) {
    return assertionError;
  }
};
export const step = (
  t: Deno.TestContext,
  text: string,
  method: (t: Deno.TestContext) => void | Promise<void>,
) => {
  return t.step(text, async (t) => {
    try {
      await method(t);
    } catch (err) {
      throw await addLinesToAssertionError(t.origin, err);
    }
  });
};
export const fn = <T extends (...args: any) => any>(fn: T): T => {
  return mock.fn(fn) as T;
};
export { expect, mock };
