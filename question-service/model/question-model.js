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
        enum : ['Easy','Medium','Hard'],
        required: true,
    },
    categories: {
        type: [String],
        /*
        type: [{
            Schema.Types.ObjectId,
            ref: "Topic"
        }],
        */
        required: true,
    },
    link:{
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Setting default to the current date/time
    },
});

QuestionModelSchema.index(
    {
        title: 'text',
        description: 'text',
        complexity: 'text',
        categories: 'text',
        link: 'text'
    }
);

QuestionModelSchema.pre('save', function(next) {
    if (this.complexity && this.complexity.length > 0) {
    this.complexity = this.complexity.charAt(0).toUpperCase() + this.complexity.slice(1);
    }
    next();
});

export default mongoose.model("QuestionModel", QuestionModelSchema);
