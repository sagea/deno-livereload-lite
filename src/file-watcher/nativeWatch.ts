export const nativeWatch = (path: string, callback: (e: Deno.FsEvent) => any) => {
  const watcher = Deno.watchFs(path);
  (async () => {
    for await (const event of watcher) callback(event);
  })();
  return watcher;
}
