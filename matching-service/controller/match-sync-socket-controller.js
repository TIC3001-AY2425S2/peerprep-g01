import { Server } from 'socket.io';
import { channel  } from "./matching-controller.js";
import { verifySocketAccessToken } from '../middleware/basic-access-control.js';
import jwt from "jsonwebtoken";

// Store connected clients
// let clients = new Map();
const matchHostExpiry =  1000 * 30; // 30 seconds
const matchPartnerExpiry = 1000 * 10; // 10 seconds

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
    ws.on('syncWithMatchGuest', async (wsMessage) => {
      try{
        console.log('syncWithMatchGuest message: ', JSON.stringify(wsMessage));
        const wsMatchUuid = wsMessage.data.matchUuid;

        // timeout to cancel the consumer of the room host queue so that the queue can be removed by rabbitmq
        timeout = setTimeout(async () => {
          console.log(`syncWithMatchGuest timed out for ${wsUsername}`);
          console.log(`syncWithMatchGuest cancel consumerTag ${myConsumerTag} for ${wsUsername}`);
          await channel.cancel(myConsumerTag);
          ws.emit('syncWithMatchGuest', {httpCode: 408, message: 'Timeout'});
          ws.disconnect();
        }, matchHostExpiry)

        await channel.cancel(myConsumerTag);
        createMatchHostQueue(wsId);
        await channel.consume(wsId, (qMessage) => {
          const myConsume = async() => {
            try{
              clearTimeout(timeout);
              const qMsgContent = qMessage.content.toString();
              const qMsgContentJson = JSON.parse(qMsgContent);
              console.log("syncWithMatchGuest channel.consume message: ", qMsgContent);
              channel.ack(qMessage);
              await channel.cancel(myConsumerTag);
              const qMatchGuestId = qMsgContentJson.data.matchGuest.id;
              const qMatchGuestUsername = qMsgContentJson.data.matchGuest.username;
              const qMatchUuid = qMsgContentJson.data.matchUuid;
              if (wsMatchUuid !== qMatchUuid){
                ws.emit('syncWithMatchGuest', {httpCode: 400, message: "Invalid room uuid" });
                console.log(`syncWithMatchGuest match uuid mismatch: qMatchUuid ${qMatchUuid} and wsMatchUuid ${wsMatchUuid}`)
                ws.disconnect();
                return;
              }
              if (wsId === qMatchGuestId){
                console.log('syncWithMatchGuest matched with self');
                ws.emit('syncWithMatchGuest', {httpCode: 400, message: "Match conflict" });
                ws.disconnect();
                return;
              }
             
              // room host sync with room guest by sending room host userid, username, room nonce to the the room guest queue
              const qSendMsgContentJson = { matchHost: { id: wsId, username: wsUsername }, matchUuid: wsMatchUuid };
              channel.sendToQueue(qMatchGuestId, Buffer.from(JSON.stringify({data: qSendMsgContentJson})));
              console.log('match host to match guest sync sent');
              ws.emit('syncWithMatchGuest', { httpCode: 200, data: qMsgContentJson });
              ws.disconnect();
            }
            catch(err){
              console.error('syncWithMatchGuest channel.consume error', err.message);
              await channel.cancel(myConsumerTag);
            }
          }
          myConsume();
        }, { consumerTag: myConsumerTag });
      }
      catch (err){
        console.error('syncWithMatchGuesterr socket error: ', err.message);
        channel.cancel(myConsumerTag);
      }
    })

    // for room partner to sync with room host
    ws.on('syncWithMatchHost', async (wsMessage) => {
      console.log('syncWithMatchHost message: ', JSON.stringify(wsMessage));
      const wsMatchHostId = wsMessage.data.matchHost.id;
      const wsMatchHostUsername = wsMessage.data.matchHost.username;
      const wsMatchUuid = wsMessage.data.matchUuid;

      if(wsId === wsMatchHostId){
        console.log('matched with self in wsMessage');
        ws.emit('syncWithMatchHost', {httpCode: 400, message: "Match conflict"});
        ws.disconnect();
        return;
      }

      // create the matchHost queue in case the room host have not created it
      await createMatchHostQueue(wsMatchHostId);
      await createMatchGuestQueue(wsId);
      const qSendMsgContentJson = {matchGuest: { id: wsId, username: wsUsername }, matchUuid: wsMatchUuid };
      channel.sendToQueue(wsMatchHostId, Buffer.from(JSON.stringify({data: qSendMsgContentJson})));
      console.log("room guest to room host sync sent")
      
      const timeout = setTimeout(() => {
        console.log(`syncWithMatchHost timed out for ${wsUsername}`);
        channel.cancel(myConsumerTag);
        ws.emit('syncWithMatchHost', {httpCode: 408, message: 'Timeout'});
        ws.disconnect();
      }, matchPartnerExpiry)
  
      await channel.cancel(myConsumerTag);

      // wait for room host to send a sync to room guest
      await channel.consume(wsId, (qMessage) => {
        const myConsume = async() => {
          clearTimeout(timeout);
          const qMsgContent = qMessage.content.toString();
          const qMsgContentJson = JSON.parse(qMsgContent);
          console.log("syncWithMatchHost channel.consume message: ", qMsgContent);
          channel.ack(qMessage);
          await channel.cancel(myConsumerTag);
          const qMatchHostId = qMsgContentJson.data.matchHost.id;
          const qMatchUuid = qMsgContentJson.data.matchUuid
          if (wsMatchUuid !== qMatchUuid){
            ws.emit('syncWithMatchHost', {httpCode: 400, message: "Invalid nonce" });
            console.log(`syncWithMatchHost match nonce mismatch: qMatchNonce ${qMatchUuid} and wsMatchNonce ${wsMatchUuid}`)
            ws.disconnect();
            return;
          }
          if (wsMatchHostId !== qMatchHostId){
            ws.emit('syncWithMatchHost', {httpCode: 400, message: 'Match conflict'})
            console.log(`syncWithMatchHost match host id mismatch: qMsg ${qMatchHostId} and wsMsg ${wsMatchHostId}`)
            ws.disconnect();
            return;
          }
          if (wsId === qMatchHostId){
            console.log('syncWithMatchHost matched with self in qMsg');
            ws.emit('syncWithMatchHost', {httpCode: 400, message: "Match conflict"});
            ws.disconnect();
            return;
          }
          ws.emit('syncWithMatchHost', { httpCode: 200, data: qMsgContentJson });
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

export async function createMatchHostQueue(queueName){
  try{
    await channel.assertQueue(queueName, { autoDelete: true, durable: false, arguments: { "x-expires":  matchHostExpiry }});
  }
  catch (err){
    console.error(err.message);
  }
}

export async function createMatchGuestQueue(queueName){
  try{
    await channel.assertQueue(queueName, { autoDelete: true, durable: false, arguments: { "x-expires":  matchPartnerExpiry }});
  }
  catch (err){
    console.error(err.message);
  }
}

export default {
  initializeSocket,
};
