import amqp from "amqplib";
import {
  createMatch as _createMatch,
  getAllMatches as _getAllMatches,
  findMatchByQuestionId as _findMatchByQuestionId,
} from "../model/repository.js";

const connection = await amqp.connect("amqp://localhost");
const queues = new Map();
const channel = await connection.createChannel();
const matchExpire = 1000 * 30; // 30 seconds

export async function matchByCategoryComplexity(req, res) {
  try {
      const {id, username, email} = req.user;
      const attribute = [ req.params.category, req.params.complexity ]; 
      const commonQueue = attribute.join(".");
      const queue = await channel.assertQueue(commonQueue, { durable: false, arguments: { "x-message-ttl": matchExpire }});
      queues[commonQueue] = queue;
      const message = await channel.get(commonQueue);
      if (message){
        console.log(`${id} matched with an existing match by ${message.properties.replyTo}`);
        channel.ack(message);
        return res.status(200).json( {message: "Success", data: {"roomHost": message.properties.replyTo} });
      }
      else{
        console.log(`creating match by ${id}`);
        const matchMessage = JSON.stringify({ id, username });
        channel.sendToQueue(commonQueue, Buffer.from(matchMessage), { replyTo: id });
        return res.status(200).json( { message: "Success", data:  {"roomHost": 'self'} });
      }
  } 
  catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error matching. Please try again" });
  }
}

export { channel };