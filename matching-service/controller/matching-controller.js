// Import the amqplib package to interact with RabbitMQ
//const amqp = require("amqplib");
import amqp from "amqplib";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { match } from "assert";


const connection = await amqp.connect("amqp://localhost");
const queueChannelMap = new Map(); // maps queue to channel

let matches = [];
let uuidJwtMap = new Map();


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
    const { ticket, category, complexity } = JSON.parse(matchData);
    if (!uuidJwtMap[ticket]){
      ws.close(1000, "Unauthorized");
    }
    for (let match of matches) {
      // matched own room. Ignore
      if(match.p1Ticket === ticket){
        continue;
      }
      match.p2Ticket = ticket;
      match.p2Ws = ws;
      match.p1Ws.send('')
    }

    let match = new Match(ticket, ws);
    matches.push(match);
    ws.send('Registered match');
  });

  // Echo back the message to the client
  // ws.send(`Echo: ${message}`);

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });

  // Send a welcome message to the client upon connection
  ws.send('match-service websocket success');

});

export async function getTicket(req, res) {
  try{
    let uuid = randomUUID();
    uuidJwtMap[uuid] = req.user.id;
    uuidJwtMap['aaa'] = req.user.id;
    return res.status(200).json({ message: 'Success', data: uuid });
  }
  catch (err){
    console.error(err);
    return res.status(500).json({ message: "Error matching. Please try again" });
  }
}

export async function createMatch(req, res) {
  // try {

  //     const {id, username, email} = req.user;
  //     const attribute = [ req.body.category, req.body.complexity ];
  //     const queue = attribute.join("_");  
  //     await handleChannelAssignment(queue);
    
  //     let channel = queueChannelMap.get(queue);   
  //     // Send the message to the queue named "message_queue". Messages are sent as a buffer
  //     const user = JSON.stringify({id, username, email});
  //     channel.sendToQueue(queue, Buffer.from(user));
  //     return res.status(200).json( { message: "Success", data: 'Created match' });
  // } 
  // catch (err) {
  //     console.error(err);
  //     return res.status(500).json({ message: "Error matching. Please try again" });
  // }
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