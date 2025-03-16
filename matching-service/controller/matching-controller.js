// Import the amqplib package to interact with RabbitMQ
//const amqp = require("amqplib");
import amqp from "amqplib";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { match } from "assert";


const connection = await amqp.connect("amqp://localhost");
const queueChannelMap = new Map(); // maps queue to channel

let userIdUuidMap = new Map();
let matchGroupListMap = new Map();

class Match {
  constructor(p1Ticket, p1Ws) {
    this.p1Ticket = p1Ticket;
    this.p1Ws = p1Ws;
    this.p2Ticket;
    this.p2Ws;
  }
}

const wsMiddleWare = (ws, req, next) => {
  try {
    const authTicket = "";
    next(); // Proceed to next handler
  }
  catch (err) {
    console.error(err);
    ws.close(); // Close connection if authentication fails
  }
};

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, req) => {
  console.log('new client connected');
  ws.on("message", (message) => {
    const matchData = message.toString();
    console.log("Received:", matchData);
    const { ticket, category, complexity, id } = JSON.parse(matchData);
    const matchGroup = ([ category, complexity ]).join("_");  
    if (!userIdUuidMap.get(id)){
      ws.close(403, "Unauthorized");
    }
    if (!matchGroupListMap.get(matchGroup)){
      matchGroupListMap.set(matchGroup, []);
    }
    for (let match of matchGroupListMap.get(matchGroup)) {
      // if matched own room, ignore
      if(match.p1Ticket === ticket){
        continue;
      }
      match.p2Ticket = ticket;
      match.p2Ws = ws;
      match.p1Ws.send(`found match with ${match.p2Ticket}`);
      match.p2Ws.send(`found match with ${match.p1Ticket}`);
      return;
    }
    
    let match = new Match(ticket, ws);
    matchGroupListMap.get(matchGroup).push(match);
  });

  // Echo back the message to the client
  // ws.send(`Echo: ${message}`);

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });

});

export async function getTicket(req, res) {
  try{
    let uuid = randomUUID();
    userIdUuidMap.set(req.user.id, uuid);
    return res.status(200).json({ message: 'Success', data: uuid });
  }
  catch (err){
    console.error(err);
    return res.status(500).json({ message: "Error matching. Please try again" });
  }
}

export async function findMatchByCategoryComplexity(req, res) {
  try {
      const {id, username, email} = req.user;
      const attribute = [ req.params.category, req.params.complexity ]; 
      const queueName = attribute.join(".");  
      await handleChannelAssignment(queueName);
      const channel = queueChannelMap.get(queueName);
      channel.get(queueName, (message) => {
        console.log("Received message:", message.content.toString());
        channel.ack(message); // Acknowledge the message so RabbitMQ knows it has been processed
        const replyMessage = `from partner ${id}`;
        const replyQueue = message.properties.replyTo;
        partnerChannel.sendToQueue(replyQueue, Buffer.from(replyMessage));
        return res.status(200).json( {message: "Success", data: "Match found"});
      });

      // send a match request message to the common queue
      const matchMessage = JSON.stringify({ id });
      const replyQueue = id;
      channel.sendToQueue(queueName, Buffer.from(matchMessage), {
        replyTo: id
      });
      return res.status(200).json( { message: "Success", data: 'Waiting for match' });

  } 
  catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error matching. Please try again" });
  }
}

export async function getMatch(req, res){
    try {
      const {id, username, email} = req.user;
      const attribute = [ req.params.category, req.params.complexity ]; 
      const queueName = attribute.join(".");  
      await handleChannelAssignment(queueName);
      const channel = queueChannelMap.get(queueName);
      channel.get(queueName, (message) => {
        console.log("Received message:", message.content.toString());
        // const message = `from partner syn + ack to match creator`;
        // const replyTo = message.properties.replyTo;
        // console.log('replyTo: ', replyTo);
        // channel.sendToQueue(replyTo, Buffer.from('consumer syn + ack to producer'), {
        //   replyTo: replyQueue.queue
        // });
        const replyTo = message.properties.replyTo;
        channel.ack(message);
        return res.status(200).json( {message: "Success", data: {replyTo: replyTo}});
      });

      return res.status(200).json( { message: "Success", data: {replyTo: ''} });
  } 
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error matching. Please try again" });
  }
}

// send a response to the replyTo queue in a message. Similar to syn + ack
export async function replyTo(req, res){
  try{
    const {id, username, email} = req.user;
    const { replyTo } = req.body;
    channel.sendToQueue(replyTo, Buffer.from(`message from ${id}`), {
      replyTo: id
    });
  }
  catch (err){
    console.error(err);
    return res.status(500).json({ message: "Error matching. Please try again" });
  }
}

export async function createMatch(req,res){
  try{
    const {id, username, email} = req.user;
    const attribute = [ req.params.category, req.params.complexity ]; 
    const queueName = attribute.join(".");
    channel.sendToQueue(queueName, Buffer.from('consumer syn + ack to producer'), {
      replyTo: id
    });
    return res.status(200).json({ message: "Success", data: `Created match on ${queueName}` });
  }
  catch (err){
    console.error(err);
    return res.status(500).json({ message: "Error matching. Please try again" });
  }
}

export async function waitSync(req, res){
  try{
    const {id, username, email} = req.user;
    const queueName = req.params.id;
    if (queueName !== id){
      return res.status(403).json({message: "Not authorized"});
    }
    const expire = 1000 * 60 * 5; // 5 minutes
    await channel.assertQueue(queueName, { exclusive: true, autoDelete: true, arguments: { "x-expires":  expire}});

    const consumerTag = await channel.consume(queueName, (message) =>{
      console.log("waitMatch received message: ", message.content.toString());
      const replyTo = message.properties.replyTo;
      channel.ack(message);
      return res.status(200).json({message: "Success", data: {"replyTo": replyTo }});
    });

    const timeout = setTimeout(() => {
      console.log("Wait match timed out");
      channel.cancel(consumerTag.consumerTag);
      channel.close();
      return res.status(408).json({message: "wait timed out"});
    }, 60000)

  }
  catch (err){
    console.error(err)
    return res.status(500).json({ message: "Error matching. Please try again" });
  }
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