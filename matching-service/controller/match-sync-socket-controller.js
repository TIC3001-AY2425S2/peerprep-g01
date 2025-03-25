import { Server } from 'socket.io';
import { channel  } from "./matching-controller.js";
import { verifySocketAccessToken } from '../middleware/basic-access-control.js';
import jwt from "jsonwebtoken";

// Store connected clients
// let clients = new Map();
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
    const wsUsername = ws.user.username;
    const wsId = ws.user.id;
    const myConsumerTag = `consumer-${wsId}`
    // clients.set(ws.id, wsId);
    console.log('ws.user.username: ', ws.user.username);
    
    // for room host to sync with room partner
    ws.on('syncWithRoomGuest', async (wsMessage) => {
      try{
        console.log('syncWithRoomGuest message: ', JSON.stringify(wsMessage));
        const wsMatchUuid = wsMessage.data.matchUuid;

        // timeout to cancel the consumer of the room host queue so that the queue can be removed by rabbitmq
        timeout = setTimeout(async () => {
          console.log(`syncWithRoomGuest timed out for ${wsUsername}`);
          console.log(`syncWithRoomGuest cancel consumerTag ${myConsumerTag} for ${wsUsername}`);
          await channel.cancel(myConsumerTag);
          ws.emit('syncWithRoomGuest', {httpCode: 408, message: 'Timeout'});
          ws.disconnect();
        }, roomHostExpiry)

        await channel.cancel(myConsumerTag);
        createRoomHostQueue(wsId);
        await channel.consume(wsId, (qMessage) => {
          const myConsume = async() => {
            try{
              clearTimeout(timeout);
              const qMsgContent = qMessage.content.toString();
              const qMsgContentJson = JSON.parse(qMsgContent);
              console.log("syncWithRoomGuest channel.consume message: ", qMsgContent);
              channel.ack(qMessage);
              await channel.cancel(myConsumerTag);
              const qRoomGuestId = qMsgContentJson.data.roomGuest.id;
              const qRoomGuestUsername = qMsgContentJson.data.roomGuest.username;
              const qMatchUuid = qMsgContentJson.data.qMatchUuid;
              if (wsMatchUuid !== qMatchUuid){
                ws.emit('syncWithRoomGuest', {httpCode: 400, message: "Invalid room uuid" });
                console.log(`syncWithRoomGuest match uuid mismatch: qMatchUuid ${qMatchUuid} and wsMatchUuid ${wsMatchUuid}`)
                ws.disconnect();
                return;
              }
              if (wsId === qRoomGuestId){
                console.log('syncWithRoomGuest matched with self');
                ws.emit('syncWithRoomGuest', {httpCode: 400, message: "Match conflict" });
                ws.disconnect();
                return;
              }
             
              // room host sync with room guest by sending room host userid, username, room nonce to the the room guest queue
              const qSendMsgContentJson = { roomHost: { id: wsId, username: wsUsername }, matchUuid: wsMatchUuid };
              channel.sendToQueue(qRoomGuestId, Buffer.from(JSON.stringify({data: qSendMsgContentJson})));
              console.log('room host to room guest sync sent');
              ws.emit('syncWithRoomGuest', { httpCode: 200, data: qMsgContentJson });
              ws.disconnect();
            }
            catch(err){
              console.error('syncWithRoomGuest channel.consume error', err.message);
              await channel.cancel(myConsumerTag);
            }
          }
          myConsume();
        }, { consumerTag: myConsumerTag });
      }
      catch (err){
        console.error('syncWithRoomGuesterr socket error: ', err.message);
        channel.cancel(myConsumerTag);
      }
    })

    // for room partner to sync with room host
    ws.on('syncWithRoomHost', async (wsMessage) => {
      console.log('syncWithRoomHost message: ', JSON.stringify(wsMessage));
      const wsMsgRoomHostId = wsMessage.data.roomHost.id;
      const wsMsgRoomHostUsername = wsMessage.data.roomHost.username;
      const wsMsgRoomNonce = wsMessage.data.roomNonce;

      if(wsId === wsMsgRoomHostId){
        console.log('matched with self in wsMessage');
        ws.emit('syncWithRoomHost', {httpCode: 400, message: "Match conflict"});
        ws.disconnect();
        return;
      }

      // create the roomHost queue in case the room host have not created it
      await createRoomHostQueue(wsMsgRoomHostId);
      await createRoomGuestQueue(wsId);
      const qSendMsgContentJson = {roomGuest: { id: wsId, username: wsUsername }, roomNonce: wsMsgRoomNonce };
      channel.sendToQueue(wsMsgRoomHostId, Buffer.from(JSON.stringify({data: qSendMsgContentJson})));
      console.log("room guest to room host sync sent")
      
      const timeout = setTimeout(() => {
        console.log(`syncWithRoomHost timed out for ${wsUsername}`);
        channel.cancel(myConsumerTag);
        ws.emit('syncWithRoomHost', {httpCode: 408, message: 'Timeout'});
        ws.disconnect();
      }, roomPartnerExpiry)
  
      await channel.cancel(myConsumerTag);

      // wait for room host to send a sync to room guest
      await channel.consume(wsId, (qMessage) => {
        const myConsume = async() => {
          clearTimeout(timeout);
          const qMsgContent = qMessage.content.toString();
          const qMsgContentJson = JSON.parse(qMsgContent);
          console.log("syncWithRoomHost channel.consume message: ", qMsgContent);
          channel.ack(qMessage);
          await channel.cancel(myConsumerTag);
          const qRoomHostId = qMsgContentJson.data.roomHost.id;
          const qRoomNonce = qMsgContentJson.data.roomNonce
          if (wsMsgRoomNonce !== qRoomNonce){
            ws.emit('syncWithRoomHost', {httpCode: 400, message: "Invalid nonce" });
            console.log(`syncWithRoomHost room nonce mismatch: qRoomNonce ${qRoomNonce} and wsMsgRoomNonce ${wsMsgRoomNonce}`)
            ws.disconnect();
            return;
          }
          if (wsMsgRoomHostId !== qRoomHostId){
            ws.emit('syncWithRoomHost', {httpCode: 400, message: 'Match conflict'})
            console.log(`syncWithRoomHost room host id mismatch: qMsg ${qRoomHostId} and wsMsg ${wsMsgRoomHostId}`)
            ws.disconnect();
            return;
          }
          if (wsId === qRoomHostId){
            console.log('syncWithRoomHost matched with self in qMsg');
            ws.emit('syncWithRoomHost', {httpCode: 400, message: "Match conflict"});
            ws.disconnect();
            return;
          }
          ws.emit('syncWithRoomHost', { httpCode: 200, data: qMsgContentJson });
          ws.disconnect();

        }
        myConsume();
      }, { consumerTag: myConsumerTag });
    });

    // Handle connection close
    ws.on('close', () => {
      console.log('Client disconnected');
      // clients.delete(ws.id);
      channel.cancel(myConsumerTag);
      clearTimeout();
    });

    ws.on('disconnect', (reason) => {
      console.log(`client ${ws.id} disconnected: `, reason);
      // clients.delete(ws.id);
      channel.cancel(myConsumerTag);
      clearTimeout(timeout);
    })

    // Handle WebSocket errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      ws.disconnect();
      // clients.delete(ws.id);
      channel.cancel(myConsumerTag);
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

export async function createRoomGuestQueue(queueName){
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
