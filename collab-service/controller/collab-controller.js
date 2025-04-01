import amqp from "amqplib";
import { isValidObjectId } from "mongoose";
import {
  createCollab as _createCollab,
  getAllCollabs as _getAllCollabs,
  findCollabById as _findCollabById,
  findCollabsByMatchUuid as _findCollabsByMatchUuid,
  findCollabsByQuestionId as _findCollabsByQuestionId,
  findCollabsByUserId as _findCollabsByUserId,
  updateCollabById as _updateCollabById,
  deleteCollabById as _deleteCollabById,
  getAllCollabs, 
} from "../model/repository.js";

const connection = await amqp.connect("amqp://localhost");
const channel = await connection.createChannel();

export async function createCollab(req, res) {
  try {
      const { matchUuid, userIds, questionId } = req.body;
      if (!(matchUuid, userIds, questionId)){
        return res.status(400).json({ message: "missing parameter" }); 
      }
      const existingCollab = await _findCollabsByMatchUuid(matchUuid);
      if(existingCollab){
        return res.status(201).json({
          message: 'Success',
          data: formatCollabResponse(existingCollab)
        })    
      }

      const createdCollab = await _createCollab(matchUuid, questionId, userIds);
      return res.status(201).json({
        message: 'Success',
        data: formatCollabResponse(createdCollab)
      })
  } 
  catch (err) {
      console.error(err.message);
      return res.status(500).json({ message: "error creating collab" });
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

export async function findCollabsByMatchUuid(req, res){
  try{
    const matchUuid = req.params.matchUuid;
    const collabs = await _findCollabsByMatchUuid(matchUuid);
    return res.status(200).json( {message: 'Success', data: collabs.map(formatCollabResponse)});
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

export async function deleteQuestion(req, res) {
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
      _id: collab.id,
      questionId: collab.questionId,
      matchUuid: collab.matchUuid,
      userIds: collab.userIds,
      createdAt: collab.createdAt,
  };
}