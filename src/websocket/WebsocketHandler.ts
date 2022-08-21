
export class WebsocketHandler {
  connections = new Set<WebSocket>();
  logConnectionCount() {
    console.log(`Socket connections: ${this.connections.size}`);
  }
  addConnection(socket: WebSocket) {
    console.log('Socket Connected');
    this.connections.add(socket);
    this.logConnectionCount();
  }
  removeConnection(socket: WebSocket) {
    const hasSocket = this.connections.has(socket);
    if (hasSocket) {
      console.log('Socket Disconnected');
      this.connections.delete(socket);
      this.logConnectionCount();
    }
  }
  sendToAll<T extends string>(data: T){
    for (const connection of this.connections) {
      console.log('emitting');
      connection.send(data);
    }
  }
  handleRequest(requestEvent: Deno.RequestEvent){
    const { socket, response } = Deno.upgradeWebSocket(requestEvent.request);
    console.log('here');
    socket.onopen = () => {
      console.log('onopen')
      this.addConnection(socket);
    }
    socket.onclose = () => {
      console.log('onclose')
      this.removeConnection(socket);
    }
    socket.onerror = (e) => {
      console.log('Socket error');
      console.error(e);
      this.removeConnection(socket);
    }
    requestEvent.respondWith(response);
  }
  close() {
    for (const connection of this.connections) {
      connection.close();
    }
  }
}
