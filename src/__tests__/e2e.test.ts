import { ensureDir, ensureDirSync, emptyDir } from "https://deno.land/std/fs/mod.ts";
import { step } from '../testUtils/mod.ts';
import { DenoLivereloadLite } from '../mod.ts';
const folderNameManager = (folderNum: number = 0) => () => `test${folderNum++}`;
const folder = folderNameManager();
Deno.test('Deno livereload lite e2e', async t => {
  await ensureDir('./src/__tests__/test-artifacts');
  await step(t, 'should spin up a server and watch for changes', () => {
    
  })
})