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

export async function createQuestion(title, description, complexity, categories, link = "") {
    return new QuestionModel({ title, description, complexity, categories, link }).save();
}

export async function getQuestions(){
    return QuestionModel.find()
}

export async function findQuestionByText(text){
    // use text-based compound index search via the $text query
    return QuestionModel.find({ $text: { $search: text } });
}

export async function findQuestionByLikeTitle(title) {
    return QuestionModel.find({ title: { $regex: title, $options: "i" }});
}

export async function findQuestionByExactTitle(title) {
    return QuestionModel.findOne({ title: {$regex: title, $options: 'i'} });
}

export async function findQuestionByDescription(description) {
    return QuestionModel.find({ description: { $regex: description, $options: "i" }});
}

export async function findQuestionByComplexity(complexity) {
    complexity = complexity.charAt(0).toUpperCase() + complexity.slice(1);
    return QuestionModel.find({ complexity });
}

export async function findQuestionById(id) {
    return QuestionModel.findById(id);
}

export async function findQuestionByCategory(category) {
    return QuestionModel.find({ categories: { $in: [category] }});
}

export async function updateQuestionById(id, title, description, complexity, categories, link) {
    return QuestionModel.findByIdAndUpdate(
        id,
        {
            $set: {
                title,
                description,
                complexity,
                categories,
                link
            },
        },
        { new: true },  // return the updated question
    );
}


export async function deleteQuestionById(id) {
    return QuestionModel.findByIdAndDelete(id);
}
