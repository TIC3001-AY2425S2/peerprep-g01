import { match } from "assert";
import CollabModel from "./collab-model.js";
import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
    let mongoDBUri =
        process.env.ENV === "PROD"
            ? process.env.DB_CLOUD_URI
            : process.env.DB_LOCAL_URI;

    await connect(mongoDBUri);
}

export async function createCollab(matchUuid, questionId, userIds) {
    return new CollabModel({ matchUuid, questionId, userIds }).save();
}

export async function getAllCollabs(){
    return CollabModel.find()
}

export async function findCollabsByMatchUuid(matchUuid){
    return CollabModel.find({ matchUuid });
}

export async function findCollabsByQuestionId(questionId){
    // use text-based compound index search via the $text query
    return CollabModel.find({ questionId });
}

export async function findCollabsByUserId(userId){
    return CollabModel.find({ 
        userIds: { $in: [ userId ]} 
    });
}

export async function findCollabById(id){
    return CollabModel.findById(id) 
}

export async function updateCollabById(id, matchUuid, questionId, userIds) {
    return CollabModel.findByIdAndUpdate(
        id,
        {
            $set: {
                matchUuid,
                questionId,
                userIds,
            },
        },
        { new: true },  // return the updated question
    );
}

export async function deleteCollabById(id) {
    return CollabModel.findByIdAndDelete(id);
}