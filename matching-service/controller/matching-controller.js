import amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";
// import {
//   createMatch as _createMatch,
//   getAllMatches as _getAllMatches,
//   findMatchByQuestionId as _findMatchByQuestionId,
// } from "../model/repository.js";

const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;
const RABBITMQ_USER = process.env.RABBITMQ_DEFAULT_USER || 'guest';
const RABBITMQ_PASS = process.env.RABBITMQ_DEFAULT_PASS || 'guest';

let connection;
let channel;

async function getRabbitMQQueueStatus(queueName, rabbitmqUrl, rabbitmqUser, rabbitmqPassword) {
  try {
    // const apiUrl = `${rabbitmqUrl}/api/queues/%2f/${queueName}`;
    const apiUrl = `${rabbitmqUrl}/api/queues/%2f/${queueName}/get`;
    const auth = Buffer.from(`${rabbitmqUser}:${rabbitmqPassword}`).toString('base64');
    const count = 1;
    const ackmode = 'ack_requeue_true';
    const encoding = 'auto';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ count, ackmode, encoding }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const queueInfo = await response.json();
    return queueInfo;
  } catch (error) {
    console.error('Error fetching RabbitMQ queue status:', error);
    return null;
  }
}

// Function to connect to RabbitMQ with retries
async function connectToRabbitMQ(retries = 5, interval = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to connect to RabbitMQ (attempt ${i + 1}/${retries})...`);
      // Use a properly formatted AMQP URL
      const amqpUrl = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}`;
      console.log(`Connecting to RabbitMQ at: ${amqpUrl}`);
      connection = await amqp.connect(amqpUrl);
      channel = await connection.createChannel();
      console.log('Successfully connected to RabbitMQ');
      return;
    } catch (error) {
      console.log(`Failed to connect to RabbitMQ (attempt ${i + 1}/${retries}):`, error.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${interval/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      } else {
        throw error;
      }
    }
  }
}

// Initialize connection
await connectToRabbitMQ();

const matchExpire = 1000 * 30; // 30 seconds

export async function matchByCategoryComplexity(req, res) {
  try {
      const {id, username, email} = req.user;
      const questionAttributes = [ req.params.category, req.params.complexity ]; 
      const questionId = req.body._id;
      console.log("matchByCategoryComplexity questionId: ", questionId);
      const commonQueue = questionAttributes.join(".");
      const queue = await channel.assertQueue(commonQueue, { durable: false, arguments: { "x-message-ttl": matchExpire }});
      const message = await channel.get(commonQueue);
      if (message){
        const messageContent = message.content.toString();
        const messageContentJson = JSON.parse(messageContent);
        console.log('matchByCategoryComplexity getMessage: ', messageContent);
        console.log(`matchGuest ${username} matched with matchHost ${messageContentJson.matchHost.username}`);
        const status = await getRabbitMQQueueStatus(commonQueue, "http://localhost:15672", "guest", "guest");
        console.log('matchByCategoryComplexity getRabbitMQQueueStatus: ', status)
        channel.ack(message);
        return res.status(200).json({ message: "Success", data: messageContentJson });
      }
      else{
        const matchUuid = uuidv4();
        console.log(`creating match for questionId ${questionId} by userId ${id} with matchUuid ${matchUuid}`);
        const messageContentJson = { matchHost: { id, username }, matchUuid: matchUuid, matchQuestionId: questionId };
        await channel.sendToQueue(commonQueue, Buffer.from(JSON.stringify(messageContentJson)));
        const status = await getRabbitMQQueueStatus(commonQueue, "http://localhost:15672", "guest", "guest");
        console.log('matchByCategoryComplexity getRabbitMQQueueStatus: ', status)
        return res.status(200).json( { message: "Success", data: messageContentJson });
      }
  }
  catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error matching. Please try again" });
  }
}

export { channel, getRabbitMQQueueStatus };