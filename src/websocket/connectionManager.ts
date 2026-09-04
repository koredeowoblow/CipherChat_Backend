import { WebSocket } from 'ws';

export interface AuthenticatedWebSocket extends WebSocket {
  userId: string;
  isAlive: boolean;
  // Keep track of which conversations this socket is subscribed to
  conversations: Set<string>;
}

class ConnectionManager {
  private connections: Map<string, Set<AuthenticatedWebSocket>> = new Map();

  /**
   * Add a new connection for a user
   */
  public addConnection(userId: string, ws: AuthenticatedWebSocket) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)?.add(ws);
  }

  /**
   * Remove a connection for a user
   */
  public removeConnection(userId: string, ws: AuthenticatedWebSocket) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  /**
   * Send a message to all connections of a specific user
   */
  public sendToUser(userId: string, data: any) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      const messageStr = JSON.stringify(data);
      userConnections.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    }
  }

  /**
   * Check if a user has any active connections
   */
  public isUserOnline(userId: string): boolean {
    const userConnections = this.connections.get(userId);
    return !!userConnections && userConnections.size > 0;
  }
}

export default new ConnectionManager();
