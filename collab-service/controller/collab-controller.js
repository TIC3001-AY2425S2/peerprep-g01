import amqp from "amqplib";
import { isValidObjectId } from "mongoose";
import {
  createCollab as _createCollab,
  getAllCollabs as _getAllCollabs,
  findCollabById as _findCollabById,
  findCollabByMatchUuid as _findCollabByMatchUuid,
  findCollabsByQuestionId as _findCollabsByQuestionId,
  findCollabsByUserId as _findCollabsByUserId,
  updateCollabById as _updateCollabById,
  updateCollabByMatchUuid as _updateCollabByMatchUuid,
  deleteCollabById as _deleteCollabById,
} from "../model/repository.js";
import "dotenv/config";

const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;
const RABBITMQ_USER = process.env.RABBITMQ_DEFAULT_USER || 'guest';
const RABBITMQ_PASS = process.env.RABBITMQ_DEFAULT_PASS || 'guest';
const queueName = "collabQueue";
let connection;
let channel;

await connectToRabbitMQ();
await consumeCollabQueue();

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

export async function produceCollabQueue(req, res) {
  try {
    const { matchUuid, userId, questionId } = req.body;
    if (!(matchUuid, userId, questionId)){
      return res.status(400).json({ message: "missing parameter" }); 
    }
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(req.body)));
    return res.status(202).json({ message: "success" });
  }
  catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "error" });
  }
}

export async function consumeCollabQueue() {
  try {
    const queue = await channel.assertQueue(queueName, { durable: false, arguments: { "x-message-ttl": 30000 }});
    await channel.consume(queueName, (message) => {
      const myConsume = async() => {
        try{
          const msgContent = message.content.toString();
          const msgContentJson = JSON.parse(msgContent);
          const { matchUuid, userId, questionId } = msgContentJson;
          console.log("consumeCollabQueue channel.consume message: ", msgContent);
          const userIds = [ userId ];
          const collab = await _updateCollabByMatchUuid(matchUuid, questionId, userIds);
          console.log('consumeCollabQueue collab: ', JSON.stringify(formatCollabResponse(collab)));
          channel.ack(message);
        }
        catch(err){
          console.error('consumeCollabQueue channel.consume error: ', err);
        }
      }
      myConsume();
    });
  }
  catch (err) {
      console.error(err.message);
      return res.status(500).json({ message: "error" });
  }
}

export async function getAllCollabs(req, res){
  try{
    const collabs = await _getAllCollabs();
    return res.status(200).json( {message: 'Success', data: collabs.map(formatCollabResponse)});
  }
  catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "error getting collabs"});
  }
}

export async function findCollabById(req, res){
  try{
    const id = req.params.id;
    const collab = await _findCollabById(id);
    return res.status(200).json( {message: 'Success', data: formatCollabResponse(collab)});
  }
  catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "error getting collab"});
  }
}

export async function findCollabByMatchUuid(req, res){
  try{
    const matchUuid = req.params.matchUuid;
    console.log('findCollabByMatchUuid matchUuid: ', matchUuid);
    const collab = await _findCollabByMatchUuid(matchUuid);
    console.log('findCollabByMatchUuid collab: ', JSON.stringify(collab));
    return res.status(200).json( {message: 'Success', data: collab});
  }
  catch (err){
    console.error(err.message);
    return res.status(500).json({ message: "error getting collab"});
  }
}

export async function findCollabsByUserId(req, res){
  try{
    const userId = req.params.userId;
    const collabs = await _findCollabsByQuestionId(userId);
    return res.status(200).json( {message: 'Success', data: collabs.map(formatCollabResponse)});
  }
  catch (err){
    console.error(err.message);
    return res.status(500).json({ message: "error getting collab"});
  }
}

export async function findCollabsByQuestionId(req, res){
  try{
    const questionId = req.params.questionId;
    const collabs = await _findCollabsByQuestionId(questionId);
    return res.status(200).json( {message: 'Success', data: collabs.map(formatCollabResponse)});
  }
  catch (err){
    console.error(err.message);
    return res.status(500).json({ message: "error getting collab"});
  }
}

export async function updateCollabById(req, res){
  try{
    const { matchUuid, questionId, userIds } = req.body;
    let message;
    if (!(matchUuid || questionId || userIds )) {
      message = 'no fields to update'
      console.log(message);
      return res.status(400).json({ message });
    }
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      message = 'Id not found';
      console.log(message);
      return res.status(404).json({ message });
    }
    const collab = await _findCollabById(id);
    if (!collab) {
      message = 'Id not found';
      console.log(message);
      return res.status(404).json({ message });
    }
    const updatedCollab = await _updateCollabById(id, matchUuid, questionId, userIds)
    return res.status(200).json( {message: 'Success', data: formatCollabResponse(updatedCollab)});
  }
  catch (err){
    console.error(err.message);
    return res.status(500).json({ message: "error getting collab"});
  }
}

export async function deleteCollabById(req, res) {
  try {
    const id = req.params.id;
    let message;
    if (!isValidObjectId(id)) {
      message = 'Id not found';
      return res.status(404).json({ message });
    }
    const collab = await _findCollabById(id);
    if (!collab) {
      message = 'Id not found';
      console.log(message);
      return res.status(404).json({ message });
    }
    await _deleteCollabById(id);
    return res.status(200).json({ message: `Success` });
    } 
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'error deleting collab' });
  }
}

export function formatCollabResponse(collab) {  
  return {
      id: collab.id,
      questionId: collab.questionId,
      matchUuid: collab.matchUuid,
      userIds: collab.userIds,
      createdAt: collab.createdAt,
  };
}