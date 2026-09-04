import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import connectionManager, { AuthenticatedWebSocket } from './connectionManager';
import messageHandler from './messageHandler';

export const setupWebSocket = (wss: WebSocketServer) => {
  wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    // Extract token from query string or headers
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      
      const authWs = ws as AuthenticatedWebSocket;
      authWs.userId = decoded.id;
      authWs.isAlive = true;
      authWs.conversations = new Set();

      connectionManager.addConnection(authWs.userId, authWs);

      authWs.on('message', (data: string) => {
        try {
          const parsedData = JSON.parse(data.toString());
          messageHandler.handleMessage(authWs, parsedData);
        } catch (error) {
          console.error('Invalid WS message format:', error);
        }
      });

      authWs.on('pong', () => {
        authWs.isAlive = true;
      });

      authWs.on('close', () => {
        connectionManager.removeConnection(authWs.userId, authWs);
      });

    } catch (error) {
      ws.close(1008, 'Invalid token');
    }
  });

  // Heartbeat to keep connections alive and clear dead ones
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      const authWs = ws as AuthenticatedWebSocket;
      if (authWs.isAlive === false) {
        connectionManager.removeConnection(authWs.userId, authWs);
        return authWs.terminate();
      }

      authWs.isAlive = false;
      authWs.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });
};
