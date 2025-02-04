import QuestionModel from "./question-model.js";
import 
import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
    let mongoDBUri =
        process.env.ENV === "PROD"
            ? process.env.DB_CLOUD_URI
            : process.env.DB_LOCAL_URI;

    await connect(mongoDBUri);
}

export async function createQuestion(name, content, difficulty, topics) {
    return new QuestionModel({ name, content, difficulty, topics }).save();
}

export async function getAllQuestions(){
    return QuestionModel.find()
}

export async function findQuestionByName(name) {
    const regex = new RegExp(name, 'i')
    return QuestionModel.find({ name: {$regex: regex}});
}


export async function findQuestionByContent(content) {
    const regex = new RegExp(content, 'i')
    return QuestionModel.find({ content: {$regex: regex}});
}

export async function findQuestionByDifficulty(difficulty) {
  return QuestionModel.find({ difficulty});
}

export async function findQuestionById(id) {
  return QuestionModel.find({ id });
}

export async function updateQuestionById(id, nane, content, difficulty, topic) {
  return QuestionModel.findByIdAndUpdate(
    id,
    {
      $set: {
        name,
        content,
        difficulty,
        topic,
      },
    },
    { new: true },  // return the updated question
  );
}


export async function deleteQuestionById(id) {
  return QuestionModel.findByIdAndDelete(id);
}
