import mongoose from "mongoose";

const Schema = mongoose.Schema;

const TopicModelSchema = new Schema({
  name: {
    type: String,
    required: true
  }
});

export default mongoose.model("TopicModel", TopicModelSchema);
