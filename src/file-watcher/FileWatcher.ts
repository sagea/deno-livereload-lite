export class FileWatcher {
  watcher: Deno.FsWatcher | undefined;
  collectedChanges: Deno.FsEvent[] = [];
  activeTimeout: number | undefined;
  constructor(
    public path: string,
    public delay: number,
    public callback: (events: Deno.FsEvent[]) => any,
  ) {}
  async start() {
    this.watcher = Deno.watchFs(this.path);
    for await (const event of this.watcher) {
      console.log(">>>> event", event);
      clearTimeout(this.activeTimeout)
      this.activeTimeout = setTimeout(() => {
        this.callback(this.collectedChanges);
        this.collectedChanges = [];
      }, this.delay);
    }
  }
  close() {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}
