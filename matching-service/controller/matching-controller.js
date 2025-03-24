import amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";
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
        const messageContent = message.content.toString();
        const messageContentJson = JSON.parse(messageContent);
        console.log('matchByCategoryComplexity getMessage: ', messageContent);
        console.log(`roomGuest ${username} matched with roomHost ${messageContentJson.roomHost.username}`);
        channel.ack(message);
        return res.status(200).json({ message: "Success", data: messageContentJson });
      }
      else{
        const roomNonce = uuidv4();
        console.log(`creating match by ${id} with room nonce ${roomNonce}`);
        const messageContentJson = { roomHost: { id, username }, roomNonce };
        // channel.sendToQueue(commonQueue, Buffer.from(JSON.stringify(matchMessage)), { replyTo: id });
        channel.sendToQueue(commonQueue, Buffer.from(JSON.stringify(messageContentJson)));
        return res.status(200).json( { message: "Success", data: messageContentJson });
      }
  }
  catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error matching. Please try again" });
  }
}

export async function createMatch(req, res) {

}

export { channel };