
console.log('Handling Commit Hooks');
for await (const { name, isFile } of Deno.readDir('./.git-hooks')) {
  if (isFile) {
    const from = `./.git-hooks/${name}`;
    const to = `./.git/hooks/${name}`;
    const content = `
    #!/bin/sh
    ${from}
    `
    await Deno.writeTextFile(to, content);
    // await Deno.copyFile(from, to);
    // console.log(`Coppied git hook "${name}": ${from} -> ${to}`);
  }
}
console.log('commit hooks applied');