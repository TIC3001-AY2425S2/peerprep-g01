import MatchModel from "./match-model.js";
import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
    let mongoDBUri =
        process.env.ENV === "PROD"
            ? process.env.DB_CLOUD_URI
            : process.env.DB_LOCAL_URI;

    await connect(mongoDBUri);
}

export async function createMatch(questionId, users) {
    return new MatchModel({ questionId, users }).save();
}

export async function getAllMatches(){
    return MatchModel.find({})
}

export async function findMatchByQuestionId(questionId) {
    return MatchModel.find(questionId);
}

export async function findMatchById(id) {
    return MatchModel.findById(id);
}

export async function findMatchByUserId(userId) {
    // Check if 'userId' is in the 'users' array
    const matches = await MatchModel.find({ users: { $in: [userId] } });
}

export async function updateMatchById(id, questionId, userId) {
    return QuestionModel.findByIdAndUpdate(
        id,
        {
            $set: {
                questionId,
                userId
            },
        },
        { new: true },  // return the updated match
    );
}

export async function deleteMatchById(id) {
    return MatchModel.findByIdAndDelete(id);
}