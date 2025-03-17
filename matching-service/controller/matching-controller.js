// Import the amqplib package to interact with RabbitMQ
//const amqp = require("amqplib");
import amqp from "amqplib";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { match } from "assert";


const connection = await amqp.connect("amqp://localhost");
const queueChannelMap = new Map(); // maps queue to channel
const queues = new Map();

const wss = new WebSocketServer({ port: 8080 });
const channel = await connection.createChannel();
const syncQueueExpire = 1000 * 60 * 1; // 1 minute

export async function findMatchByCategoryComplexity(req, res) {
  try {
      const {id, username, email} = req.user;
      const attribute = [ req.params.category, req.params.complexity ]; 
      const commonQueue = attribute.join(".");
      const expire = 1000 * 60 * 1; // 1 minutes
      const queue = await channel.assertQueue(commonQueue, { arguments: { "x-message-ttl": expire }});
      queues[commonQueue] = queue;
      const message = await channel.get(commonQueue);
      if (message){
        console.log("Received message:", message.content.toString());
        console.log(message.properties.replyTo);
        channel.ack(message);
        return res.status(200).json( {message: "Success", data: {"room_host": message.properties.replyTo} });
      }
      else{
        const matchMessage = JSON.stringify({ id });
        channel.sendToQueue(commonQueue, Buffer.from(matchMessage), {
          replyTo: id
        });
        return res.status(200).json( { message: "Success", data: 'wait_partner' });
      }

      // channel.get(queueName, (message) => {
      //   console.log("Received message:", message.content.toString());
      //   channel.ack(message); // Acknowledge the message so RabbitMQ knows it has been processed
      //   const replyMessage = `from partner ${id}`;
      //   const replyTo = message.properties.replyTo;
        
      //   partnerChannel.sendToQueue(replyTo, Buffer.from(replyMessage));
      //   return res.status(200).json( {message: "Success", data: "Match found"});
      // });

      // // if there's no match request in the common queue, send a match request message to the common queue to create a match request
      // const matchMessage = JSON.stringify({ id });
      // channel.sendToQueue(queueName, Buffer.from(matchMessage), {
      //   replyTo: id
      // });
      // return res.status(200).json( { message: "Success", data: 'Waiting for match' });
  } 
  catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error matching. Please try again" });
  }
}

export async function syncWithRoomHost(req, res){
  // for room partner to sync with room host
  const {id, username, email} = req.user;
  const roomHostId = req.params.roomHostId;
  await channel.assertQueue(roomHostId, { autoDelete: true, arguments: { "x-expires":  syncQueueExpire}});
  channel.sendToQueue(roomHostId, Buffer.from(id), { expiration: expire });
  await channel.assertQueue(id, { autoDelete: true, arguments: { "x-expires":  syncQueueExpire}});
  const consumerTag = await channel.consume(myQueue, (message) => {
    console.log("syncWithRoomHost received message: ", message.content.toString());
    channel.ack(message);
    const syncRoomHostId = message.content.id;
    if (syncRoomHostId === roomHostId ){
      return res.status(200).json({message: "Success", data: message.content.toString() });
    }
  });

  const timeout = setTimeout(() => {
    console.log("Wait match timed out");
    channel.cancel(consumerTag.consumerTag);
    channel.close();
    return res.status(408).json({message: "wait timed out"});
  }, syncQueueExpire)
}

export async function syncWithRoomPartner(req, res){
  // for room host to sync with room partner
  const {id, username, email} = req.user;
  await channel.assertQueue(id, { autoDelete: true, durable: false, arguments: { "x-expires":  syncQueueExpire}});
  const consumerTag = await channel.consume(id, (message) => {
    console.log("syncWithRoomPartner received message: ", message.content.toString());
    channel.ack(message);
    const partnerQueue = message.properties.replyTo;
    (async () => {
      const expire = 1000 * 60 * 1; // 1 minutes
      await channel.assertQueue(partnerQueue, { exclusive: true, autoDelete: true, arguments: { "x-expires":  expire}});
      channel.sendToQueue(roomHostId, Buffer.from(id), { expiration: expire });
    });
    return res.status(200).json({message: "Success", data: message.content.toString() });
  });

  const timeout = setTimeout(() => {
    console.log("Wait match timed out");
    channel.cancel(consumerTag.consumerTag);
    return res.status(408).json({message: "wait timed out"});
  }, syncQueueExpire)
}

export async function findRandomMatch(req,res){
  try{
    const {id, username, email} = req.user;
    const attribute = [ req.params.category, req.params.complexity ]; 
    const queue = attribute.join("_");

    await handleChannelAssignment(queue);
    let channel = queueChannelMap.get(queue);
    const message = await channel.get(queue, { noAck: false });
    if (message) {
      const content = message.content.toString();
      console.log(`[${queue}] get received:`, content);
      const partner_id = JSON.parse(content).id;
      if (partner_id !== id){
        channel.ack(message);
        return res.status(200).json({ message: 'Success', data: content });
      }
      else{
        channel.nack(message);
        return res.status(200).json({ message: 'Success', data: "No match found" });
      }
      
      // send request to collab-service API to create match
    }
  //   else{
  //     const { consumerTag } = await channel.consume(queue, (message) => {
  //       if (message) {
  //           const content = message.content.toString();
  //           console.log(`[${queue}] consume Received:`, content);
  //           channel.ack(message);
  //           // send request to collab-service API to create match
  //           // Cancel the consumer after processing
  //           clearTimeout(timeoutTimer);  // Clear the timeout if a message is received
  //           channel.cancel(consumerTag);  // Cancel the consumer after timeout
  //           return res.status(200).json({ message: 'Success', data: content });
  //       }
  //     }, { noAck: false });  
  //     const timeoutTimer = setTimeout(async () => {
  //       console.log('Timeout reached, cancelling consumer...');
  //       try {
  //           await channel.cancel(consumerTag);  // Cancel the consumer after timeout
  //           return res.status(200).json({message: `Success`, data: 'No match found'})
  //       } catch (err) {
  //           return res.status(500).json({ message: 'server error' });
  //       }
  //   }, 10000);
  // }
    return res.status(200).json({message: `Success`, data: 'No match found'})
}
  catch (err){
    console.error(err);
    return res.status(500).json({ message: "Error matching. Please try again" });
  }
}


async function handleChannelAssignment(queue){
  let channel = queueChannelMap.get(queue);
  if (!channel) {
    console.log(`Channel not exists for ${queue}. Creating...`);
    channel = await connection.createChannel();
    await channel.assertQueue(queue);
    queueChannelMap.set(queue, channel);
    console.log(`Created channel for ${queue}`);
  }
}

/*
message queue design
1) user gets message from queue
1.1) if queue is empty, user creates a match message containing a correlation ID and a reply-to queue
1.1.1) user creates a new private queue to wait for messages
1.1.2) when the user receives a message on the new queue, it means that another user consumed his message, and is successfully matched with him
1.1.3) both user ack the message, and proceeds to the collab space

1.2) if the queue is not empty, user consumes the message, and sends a message to the reply-to queue to confirm the match
1.3) both users ack the message, and proceeds to the collab space

in matching-controller, maintain the state of consumer and producer

*/