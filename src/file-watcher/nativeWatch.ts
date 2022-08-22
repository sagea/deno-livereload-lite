export const nativeWatch = (
  path: string,
  callback: (e: Deno.FsEvent) => void,
) => {
  const watcher = Deno.watchFs(path);
  (async () => {
    for await (const event of watcher) callback(event);
  })();
  return watcher;
};
