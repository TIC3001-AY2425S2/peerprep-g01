// Import the amqplib package to interact with RabbitMQ
//const amqp = require("amqplib");
import amqp from "amqplib";
import { consumeMessage, messageEvent } from "../match-consumer.js";
import { EventEmitter } from "events";
//import messageEvent from "../match-consumer.js";


export async function createMatch(req, res) {
  // try {

  //     // type of questions. E.g., algorithms category, hard difficulty
  //     const questionType = req.body.type;

  //     // the user that sends the message
  //     const user = req.body.user;
    
  //     // Assert a queue exists (or create it if it doesn't)      
  //     const messageQueue = Object.entries(questionType).map(([key, value]) => `${key}_${value}`).join("_");
  //     await channel.assertQueue(messageQueue);
    
  //     // Connect to RabbitMQ server
  //     const connection = await amqp.connect("amqp://localhost");
  //     const channel = await connection.createChannel();
    
  //     // Send the message to the queue named "message_queue". Messages are sent as a buffer
  //     channel.sendToQueue(messageQueue, Buffer.from(user));
    
  //     // Close the channel and the connection to clean up resources
  //     await channel.close();
  //     await connection.close();
    
  //     return res.status(200).json( { message: "Success" });
  // } 
  // catch (err) {
  //     console.error(err);
  //     return res.status(500).json({ message: "Error matching. Please try again" });
  // }
}

export async function findMatch(req,res){
  // try{
  //   // type of questions. E.g., algorithms category, hard difficulty
  //   const matchChannel = req.params.matchChannel

  //   // the user that sends the message
  //   const authHeader = req.headers["authorization"];
  //   if (!authHeader){
  //     console.error("No auth header");
  //     return res.status(500).json({message: "Error matching"});
  //   }

  //   // Create a connection to the local RabbitMQ server
  //   const connection = await amqp.connect("amqp://localhost");
  //   const channel = await connection.createChannel();

  //   // Assert a queue exists (or create it if it doesn't) named "message_queue"
  //   // const messageQueue = Object.entries(questionType).map(([key, value]) => `${key}_${value}`).join("_");
  //   await channel.assertQueue(matchChannel);

  //   // Start consuming messages from the queue "message_queue"
  //   channel.consume(matchChannel, (message) => {
  //     if (message){
  //       console.log("Received message:", message.content.toString());
  //       channel.ack(message); // Acknowledge the message so RabbitMQ knows it has been processed
  //       channel.close();
  //       return res.status(200).json({ message: "Success", data: message.content.toString()});
  //     }
  //   }, {noAck: false});
    
  //   //return res.status(200).json({ message: "Success", data: "no message"});
    

  // }
  // catch (err) {
  //   console.error(err);
  //   return res.status(500).json({ message: "Error matching" });
  // }

  try{
    const timeout = 10000; // 30 seconds timeout
    console.log("Match request received. Waiting for a match...");
    const matchPromise = new Promise((resolve, reject) => {
      const onMessageReceived = (message, ackCallback)  => {
      resolve({ message, ackCallback });
    };

    // listen for event only once. Call onMessageReceived if there's event
    messageEvent.once("newMessage", onMessageReceived);

    consumeMessage("testQueue");

    setTimeout(() => {
      messageEvent.removeListener("newMessage", onMessageReceived);
      reject(new Error("timeout"));
    }, timeout);
    });

    const { message, ackCallback } = await matchPromise;
    ackCallback();
    return res.status(200).json({ message: "Match found", data: message});
  }
  catch (err) {
    res.status(204).end(); // 204 No Content (Timeout)
  }
}
