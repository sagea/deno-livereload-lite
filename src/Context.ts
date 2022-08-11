export type ResponseHook = (response: Response, context: Context) => Response | Promise<Response>;

export class Context {
  orig: Deno.RequestEvent;
  url: URL;
  filePath: string;
  responseHeaders = new Headers();
  responseHook: ResponseHook;
  constructor(
    requestEvent: Deno.RequestEvent,
    responseHook: ResponseHook,
  ) {
    this.orig = requestEvent;
    this.url = new URL(requestEvent.request.url);
    this.filePath = decodeURIComponent(this.url.pathname);
    this.responseHook = responseHook;
  }
  async respondWith(response: Response) {
    for (let [key, value] of this.responseHeaders) {
      response.headers.set(key, value);
    }
    this.orig.respondWith(await this.responseHook(response, this));
  }
  get request() { return this.orig.request; }
  get headers() { return this.orig.request.headers }
}
