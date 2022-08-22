export const nativeHttpServer = (
  options: Deno.ListenOptions,
  callback: (httpConn: Deno.HttpConn) => void,
) => {
  const server = Deno.listen(options);
  (async () => {
    for await (const conn of server) callback(Deno.serveHttp(conn));
  })();
  return server;
};
