import mongoose from "mongoose";

const Schema = mongoose.Schema;

const QuestionModelSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    complexity: {
        type: String,
        enum : ['easy','medium','hard'],
        required: true
    },
    categories: {
        type: [String],
        /*
        type: [{
            Schema.Types.ObjectId,
            ref: "Topic"
        }],
        */
        required: true
    },
    link:{
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now, // Setting default to the current date/time
    }
});

export default mongoose.model("QuestionModel", QuestionModelSchema);
