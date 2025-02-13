// Import the express package to create and configure the server
const express = require("express");

// Import the amqplib package to interact with RabbitMQ
const amqp = require("amqplib");

// Initialize the express application
const app = express();

// Import the cors middleware to enable CORS on the server
const cors = require("cors");

// Configure CORS to allow requests from a specific origin (http://localhost:3000) and to handle preflight requests
app.options(
  "*",
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
  })
);
app.use(cors());

// Define a GET route "/send" that will be used to send messages to RabbitMQ
app.get("/send/:message", async (req, res) => {
  const message = req.params.message; // Get the message from the route parameter

  const connection = await amqp.connect("amqp://localhost"); // Create a connection to the local RabbitMQ server
  const channel = await connection.createChannel();

  // Assert a queue exists (or create it if it doesn't) named "message_queue"
  await channel.assertQueue("message_queue");

  // Send the message to the queue named "message_queue". Messages are sent as a buffer
  channel.sendToQueue("message_queue", Buffer.from(message));

  // Close the channel and the connection to clean up resources
  await channel.close();
  await connection.close();

  // Send a response back to the client to indicate the message was sent
  res.send("Message sent to RabbitMQ");
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log("Producer running on port 3000");
});
