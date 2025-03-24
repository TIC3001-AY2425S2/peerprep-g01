// controllers/WebSocketController.js
import { Server } from 'socket.io';

// Store connected clients
let clients = [];

const initializeSocket = (httpServer) => {
  const wss = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:2999', // Allow requests from your React app
      methods: ['GET', 'POST'],
    },
  });

  // Handle new WebSocket connections
  wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.push(ws);  // Add client to the list

    // Send a welcome message to the client
    ws.send('Welcome to the WebSocket server!');

    // Handle incoming messages from the client
    ws.on('message', (message) => {
      console.log('Received message:', message);

      // Broadcast the message to all clients
      clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    // Handle connection close
    ws.on('close', () => {
      console.log('Client disconnected');
      clients = clients.filter(client => client !== ws);  // Remove client from list
    });

    ws.on('disconnect', (reason) => {
      console.log(`client ${ws.id} disconnected: `, reason);
    })

    // Handle WebSocket errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
};

export default {
  initializeSocket,
};
