// Require the amqplib package to interact with RabbitMQ
const amqp = require("amqplib");

// Immediately-invoked Function Expression (IIFE) to use async-await at the top level
(async () => {
  // Create a connection to the local RabbitMQ server
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  // Assert a queue exists (or create it if it doesn't) named "message_queue"
  await channel.assertQueue("message_queue");

  // Start consuming messages from the queue "message_queue"
  channel.consume("message_queue", (message) => {
    console.log("Received message:", message.content.toString());
    channel.ack(message); // Acknowledge the message so RabbitMQ knows it has been processed
  });

  console.log("Consumer waiting for messages...");
})();
