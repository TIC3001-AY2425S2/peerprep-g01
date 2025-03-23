// Import the amqplib package to interact with RabbitMQ
//const amqp = require("amqplib");
import amqp from "amqplib";

const connection = await amqp.connect("amqp://localhost");
const queues = new Map();
const channel = await connection.createChannel();
const roomPartnerExpiry = 1000 * 30; // 10 seconds
const roomHostExpiry =  1000 * 10; // 30 seconds
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

export async function syncWithRoomHost(req, res){
  // for room partner to sync with room host
  // 1. Room Partner ensure the Room Host queue is available
  // 2. Room Partner sends a sync message to the Room Host queue 
  // 3. Room Partner ensure that its own queue is available
  // 4. Room Partner wait for sync message from Room Host till timeout
  let consumerTag;
  try{
    const {id, username, email} = req.user;
    consumerTag = `consumer-${id}`;
    const roomHostId = req.params.roomHostId;
    if(id === roomHostId){
      return res.status(409).json({ message: "Match conflict" });
    }
    await createRoomHostQueue(roomHostId);
    const matchMessage = JSON.stringify({ id, username });
    channel.sendToQueue(roomHostId, Buffer.from(matchMessage), { replyTo: id });
    console.log("room partner to room host sync sent")
    await createRoomPartnerQueue(id);
    
    const timeout = setTimeout(() => {
      console.log(`syncWithRoomHost timed out for ${username}`);
      channel.cancel(consumerTag);
      return res.status(408).json({message: "wait timed out"});
    }, roomPartnerExpiry)

    await channel.cancel(consumerTag);
    await channel.consume(id, (message) => {
      const myconsume = async() => {
        clearTimeout(timeout);
        const messageContent = message.content.toString();
        console.log("syncWithRoomHost received message: ", messageContent);
        channel.ack(message);

        // might need this to terminate the consumer. otherwise, would have error of "Cannot set headers after they are sent" for subsequent requests
        await channel.cancel(consumerTag);
        const msgRoomHostId = (JSON.parse(messageContent)).id;
        if (msgRoomHostId === roomHostId ){
          return res.status(200).json({ message: "Success", data: message.content.toString() });
        }
        else{
          return res.status(409).json({ message: "Match conflict" });
        }
      }
      myconsume();
    }, { consumerTag });
  }
  catch (err){
    console.log(err.message);
    channel.cancel(consumerTag)
    return res.status(500).json({message: "server error"});
  }
}

export async function syncWithRoomPartner(req, res){
  // for room host to sync with room partner
  // 1. Room Host ensure that its queue is available
  // 2. Room Host sends a sync message to the Room Partner queue 
  // 3. Room host waits for sync message from Room Partner till timeout
  // 4. Upon receiving sync message from the Room Partner
  // 5. Room Host ensure that the Room Partner queue is available
  // 6. Room Host send sync message to the Room Partner queue
  // 7. Room Partner wait for sync message from Room Host
  let consumerTag;
  console.log("sync with room partner")
  try{
    const {id, username, email} = req.user;
    consumerTag = `consumer-${id}`;
    await createRoomHostQueue(id);
    
    const timeout = setTimeout(async () => {
      console.log(`syncWithRoomPartner timed out for ${username}`);
      console.log(`timeout cancel consumerTag ${consumerTag} for ${username}`);
      await channel.cancel(consumerTag);
      console.log('return timeout');
      return res.status(408).json({message: "wait timed out"});
    }, roomHostExpiry)

    await channel.cancel(consumerTag);
    await channel.consume(id, (message) => {
      const myconsume = async() => {
        try{
          clearTimeout(timeout);
          console.log("syncWithRoomPartner received message: ", message.content.toString());
          channel.ack(message);
  
          // might need this to terminate the consumer. otherwise, would have error of "Cannot set headers after they are sent" for subsequent requests
          await channel.cancel(consumerTag);
          const partnerQueue = message.properties.replyTo;
          console.log(`room host partner: ${partnerQueue}`);
          const matchMessage = JSON.stringify({ id, username });
          if (id === partnerQueue){
            return res.status(409).json({ message: "Match conflict" });
          }
          channel.sendToQueue(partnerQueue, Buffer.from(matchMessage));
          console.log('room host to room partner sync sent');
          return res.status(200).json({ message: "Success", data: message.content.toString() });
        }
        catch(err){
          console.error('syncWithRoomPartner consume error', err.message);
          await channel.cancel(consumerTag);
        }
      }
      myconsume();
    }, { consumerTag });
  }
  catch (err){
    console.error(err.message);
    await channel.cancel(consumerTag);
    return res.status(500).json({message: "server error"});
  }
}

export async function cancelWait(req, res){
  try{
    const {id, username, email} = req.user;
    const consumerTag = `consumer-${id}`;
    await channel.cancel(consumerTag);
    return res.status(200).json({message: "Success", data: ""});
  }
  catch(err){
    console.log(err.message);
    return res.status(500).json({message: "server error"});
  }
}

async function createRoomHostQueue(queueName){
  try{
    await channel.assertQueue(queueName, { autoDelete: true, durable: false, arguments: { "x-expires":  roomHostExpiry }});
  }
  catch (err){
    console.error(err.message);
  }
}

async function createRoomPartnerQueue(queueName){
  try{
    await channel.assertQueue(queueName, { autoDelete: true, durable: false, arguments: { "x-expires":  roomPartnerExpiry }});
  }
  catch (err){
    console.error(err.message);
  }
}