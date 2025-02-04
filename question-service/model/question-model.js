import mongoose from "mongoose";

const Schema = mongoose.Schema;

const QuestionModelSchema = new Schema({
    /*
    id:{
        type: Number,
        unique: true,
        required: true,
        default: 0
    },
    */
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    difficulty : {
        type: String,
        enum : ['easy','medium','hard']
        required: true
    },
    topics: {
        type: [String],
        /*
        type: [{
            Schema.Types.ObjectId,
            ref: "Topic"
        }],
        */
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now, // Setting default to the current date/time
    }
});

export default mongoose.model("QuestionModel", QuestionModelSchema);
