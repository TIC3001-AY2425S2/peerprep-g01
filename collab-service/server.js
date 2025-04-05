import http from "http";
import index from "./index.js";
import "dotenv/config";
import { connectToDB } from "./model/repository.js";
import { WebSocketServer } from 'ws';
// import { createServer } from 'y-websocket';
import * as Y from 'yjs';
import { LeveldbPersistence } from 'y-leveldb'; // Optional: For persistent storage

const persistence = new LeveldbPersistence('./leveldb')
const port = process.env.PORT || 3004;

const server = http.createServer(index);

await connectToDB().then(() => {
  console.log("MongoDB Connected!");
  server.listen(port);
  console.log("Collab service server listening on http://localhost:" + port);
}).catch((err) => {
  console.error("Failed to connect to DB");
  console.error(err);
});                


// const wss = new WebSocketServer({ server });

// const yServer = createServer({
//   port: port, // You can specify the port here as well
//   // Other options like persistence
// });

// wss.on('connection', (conn, req) => {
//   yServer.handleConnection(conn, req);
//   console.log('New WebSocket connection established.');
// });

// // Handle WebSocket connections
// wss.on('connection', (conn, req) => {
//   yServer.handleConnection(conn, req);
//   console.log('New WebSocket connection established.');
// });