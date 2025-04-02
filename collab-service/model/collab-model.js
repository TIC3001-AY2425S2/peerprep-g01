import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CollabModelSchema = new Schema({
    questionId: {
        type: String,
        required: true,
    },
    matchUuid: {
        type: String,
        required: true,
        unique: true,
    },
    userIds:{
        type: [String],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now, // Setting default to the current date/time
    },
});

CollabModelSchema.index(
    {
        questionId: 'text',
        matchUuid: 'text',
        userIds: 'text',
        createdAt: 'text',
    }
);

export default mongoose.model("CollabModel", CollabModelSchema);
