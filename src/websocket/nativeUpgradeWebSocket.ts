export const nativeUpgradeWebSocket = (request: Request) => {
  return Deno.upgradeWebSocket(request)
}
