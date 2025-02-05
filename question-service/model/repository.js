import QuestionModel from "./question-model.js";
import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
    let mongoDBUri =
        process.env.ENV === "PROD"
            ? process.env.DB_CLOUD_URI
            : process.env.DB_LOCAL_URI;

    await connect(mongoDBUri);
}

export async function createQuestion(title, description, complexity, categories) {
    return new QuestionModel({ title, description, complexity, categories }).save();
}

export async function getQuestions(){
    return QuestionModel.find()
}

export async function findQuestionByTerm(term){
    return QuestionModel.find({
        $or:[
            { _id: { $regex: term, $options: "i" }},
            { title: { $regex: term, $options: "i" }},
            { description: { $regex: term, $options: "i"}},
            { complexity: { $regex: term, $options: "i" }},
            { categories: { $regex: term, $options: "i" }},
            { link: { $regex: term, $options: "i" }}
        ]
    });
}

export async function findQuestionByLikeTitle(name) {
    return QuestionModel.find({ name: { $regex: name, $options: "i" }});
}

export async function findQuestionByExactTitle(name) {
    return QuestionModel.findOne({ name });
}

export async function findQuestionByDescription(desc) {
    return QuestionModel.find({ desc: { $regex: desc, $options: "i" }});
}

export async function findQuestionByComplexity(complexity) {
    return QuestionModel.find({ complexity });
}

export async function findQuestionById(id) {
    return QuestionModel.findById({ id });
}

export async function findQuestionByCategory(category) {
    return QuestionModel.find({ categories: { $in: [category] }});
}

export async function updateQuestionById(id, name, content, complexity, topic) {
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
