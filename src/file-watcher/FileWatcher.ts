import { nativeWatch } from './nativeWatch.ts';

export class FileWatcher {
  watcher: Deno.FsWatcher | undefined;
  collectedChanges: Deno.FsEvent[] = [];
  activeTimeout: number | undefined;
  constructor(
    public path: string,
    public delay: number,
    public callback: (events: Deno.FsEvent[]) => void,
  ) {}
  start() {
    this.watcher = nativeWatch(this.path, (event) => {
      console.log('>>>> event', event);
      clearTimeout(this.activeTimeout);
      this.activeTimeout = setTimeout(() => {
        this.callback(this.collectedChanges);
        this.collectedChanges = [];
      }, this.delay);
    });
  }
  close() {
    this.watcher?.close();
  }
}
