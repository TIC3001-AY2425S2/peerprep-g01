import amqp from "amqplib";
import { EventEmitter } from "events";
import { successMatchEvent } from "./controller/matching-controller";

const messageEvent = new EventEmitter(); // Event system to notify HTTP server
const queueChannelMap = new Map(); // maps queue to channel

const connection = await amqp.connect("amqp://localhost");

export async function consumeMessage(queueName){
  let channel = queueChannelMap.get(queueName);
  if (!channel){
    console.log(`channel not exists for ${queueName}. Creating...`);
    channel = await connection.createChannel();
    await channel.assertQueue(queueName);
    queueChannelMap.set(queueName, channel); // Store channel in map
    console.log(`created channel for ${queueName}`);
    channel.consume(queueName,(message) => {
      if (message) {
        const msgContent = message.content.toString();
        console.log(`[${queueName}] Received:`, msgContent);

        // Emit an event with the queueName
        messageEvent.emit(`message:${queueName}`, msgContent, () => {
          channel.ack(message);
        });
      }
    },
    { noAck: false }
    );
  }


  // Start consuming messages for this queue
  // channel.consume(queueName,(message) => {
  //     if (message) {
  //       const msgContent = message.content.toString();
  //       console.log(`[${queueName}] Received:`, msgContent);

  //       // Emit an event with the queueName
  //       messageEvent.emit(`message:${queueName}`, msgContent);
  //       channel.ack(message);
  //     }
  //   },
  //   { noAck: false }
  // );
}

export { messageEvent };