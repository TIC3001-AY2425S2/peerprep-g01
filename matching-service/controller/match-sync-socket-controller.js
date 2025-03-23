import { Server } from 'socket.io';
import { channel  } from "./matching-controller.js";
import { verifySocketAccessToken } from '../middleware/basic-access-control.js';

// Store connected clients
let clients = new Map();
const roomHostExpiry =  1000 * 30; // 30 seconds
const roomPartnerExpiry = 1000 * 10; // 10 seconds

const initializeSocket = (httpServer) => {
  const wss = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:2999', // Allow requests from your React app
      methods: ['GET', 'POST'],
    },
  });

  wss.use(verifySocketAccessToken);
  
  // Handle new WebSocket connections
  wss.on('connection', (ws) => {
    console.log('New client connected');
    let timeout;
    const username = ws.user.username;
    const id = ws.user.id;
    const consumerTag = `consumer-${id}`
    clients.set(ws.id, id);
    console.log('ws.user.username: ', ws.user.username);
    
    // Send a welcome message to the client
    ws.send('Welcome to the WebSocket server!');

    // Handle incoming messages from the client
    ws.on('message', (message) => {
      console.log('Received message:', message);
    });
    
    // ws.emit('syncWithRoomPartner', 'sync test from server');

    ws.on('syncWithRoomPartner', async (message) => {
      console.log('websocket syncWithPartner: ', message);
      try{
        timeout = setTimeout(async () => {
          console.log(`websocket SyncWithRoomPartner timed out for ${username}`);
          console.log(`websocket SyncWithRoomPartner cancel consumerTag ${consumerTag} for ${username}`);
          await channel.cancel(consumerTag);
          ws.emit('syncWithRoomPartner', {httpCode: 408, message: 'Timeout'});
          ws.disconnect();
        }, roomHostExpiry)

        await channel.cancel(consumerTag);
        createRoomHostQueue(id);
        await channel.consume(id, (message) => {
          const myconsume = async() => {
            let messageContent;
            try{
              clearTimeout(timeout);
              messageContent = message.content.toString();
              console.log("syncWithRoomPartner received message: ", JSON.parse(messageContent));
              channel.ack(message);
              await channel.cancel(consumerTag);
              const partnerQueue = message.properties.replyTo;
              console.log(`room partner: ${partnerQueue}`);
              const matchMessage = JSON.stringify({ id, username });
              if (id === partnerQueue){
                ws.emit('syncWithRoomPartner', {httpCode: 408, message: "Match conflict" });
                ws.disconnect();
              }
              else{
                channel.sendToQueue(partnerQueue, Buffer.from(matchMessage));
                console.log('room host to room partner sync sent');
                ws.emit('syncWithRoomPartner', { httpCode: 200, data: JSON.parse(messageContent) });
                ws.disconnect();
              }
            }
            catch(err){
              console.error('syncWithRoomPartner consume error', err.message);
              await channel.cancel(consumerTag);
            }
          }
          myconsume();
        }, { consumerTag });
      }
      catch (err){
        console.error(err.message);
        channel.cancel(consumerTag);
      }
    })

    ws.on('syncWithRoomHost', async (message) => {
      console.log('websocket syncWithRoomHost: ', message);
      const roomHost = message.roomHost;
      if(id === roomHost){
        ws.emit('syncWithRoomHost', {httpCode: 409, message: "Match conflict"});
        ws.disconnect();
      }
      await createRoomHostQueue(roomHost);
      const matchMessage = JSON.stringify({ id, username });
      channel.sendToQueue(roomHost, Buffer.from(matchMessage), { replyTo: id });
      console.log("room partner to room host sync sent")
      await createRoomPartnerQueue(id);
      
      const timeout = setTimeout(() => {
        console.log(`syncWithRoomHost timed out for ${username}`);
        channel.cancel(consumerTag);
        ws.emit('syncWithRoomHost', {httpCode: 408, message: 'Timeout'});
        ws.disconnect();
      }, roomPartnerExpiry)
  
      await channel.cancel(consumerTag);
      createRoomHostQueue(id);
      await channel.consume(id, (message) => {
        let messageContent;
        const myconsume = async() => {
          clearTimeout(timeout);
          messageContent = message.content.toString();
          console.log("syncWithRoomHost received message: ", JSON.parse(messageContent));
          channel.ack(message);
          await channel.cancel(consumerTag);
          const msgRoomHost = (JSON.parse(messageContent)).id;
          if (msgRoomHost === roomHost ){
            ws.emit('syncWithRoomHost', { httpCode: 200, data: JSON.parse(messageContent) });
            ws.disconnect();
          }
          else{
            ws.emit('syncWithRoomHost', { httpCode: 409, message: "Match conflict"} );
            ws.disconnect();
          }
        }
        myconsume();
      }, { consumerTag });
    });

    // Handle connection close
    ws.on('close', () => {
      console.log('Client disconnected');
      clients.delete(ws.id);
      channel.cancel(consumerTag);
      clearTimeout();
    });

    ws.on('disconnect', (reason) => {
      console.log(`client ${ws.id} disconnected: `, reason);
      clients.delete(ws.id);
      channel.cancel(consumerTag);
      clearTimeout(timeout);
    })

    // Handle WebSocket errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      ws.disconnect();
      clients.delete(ws.id);
      channel.cancel(consumerTag);
      clearTimeout(timeout);
    });
  });
};

export async function createRoomHostQueue(queueName){
  try{
    await channel.assertQueue(queueName, { autoDelete: true, durable: false, arguments: { "x-expires":  roomHostExpiry }});
  }
  catch (err){
    console.error(err.message);
  }
}

export async function createRoomPartnerQueue(queueName){
  try{
    await channel.assertQueue(queueName, { autoDelete: true, durable: false, arguments: { "x-expires":  roomPartnerExpiry }});
  }
  catch (err){
    console.error(err.message);
  }
}

export default {
  initializeSocket,
};
