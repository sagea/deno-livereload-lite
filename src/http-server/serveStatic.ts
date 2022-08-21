import { extname } from 'https://deno.land/std@0.151.0/path/mod.ts';
import { Middleware } from "./middleware.ts";

export const serveStatic = (path: string, contentTypeMappings: Record<string, string>): Middleware => async(ctx) => {
  let filePath = ctx.filePath;
  // Try opening the file
  let file;
  let fullFilePath;
  try {
    if (filePath === '/') {
      filePath = '/index.html';
    }
    fullFilePath = `${path}/${filePath}`;
    file = await Deno.open(fullFilePath, { read: true });
  } catch {
    // If the file cannot be opened, return a "404 Not Found" response
    const notFoundResponse = new Response("404 Not Found", { status: 404 });
    await ctx.respondWith(notFoundResponse);
    return;
  }

  // Build a readable stream so the file doesn't have to be fully loaded into
  // memory while we send it
  const readableStream = file.readable;
  // Build and send the response
  const response = new Response(readableStream);
  const fileExt = extname(filePath);
  const contentType = contentTypeMappings[fileExt];
  if (contentType) {
    response.headers.set('Content-Type', contentType);
  }

  await ctx.respondWith(response);
}
