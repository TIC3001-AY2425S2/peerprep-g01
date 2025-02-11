import http from "http";
import index from "./index.js";
import "dotenv/config";
import { connectToDB } from "./model/repository.js";

const port = process.env.PORT || 3002;

const server = http.createServer(index);

await connectToDB().then(() => {
  console.log("MongoDB Connected!");

  server.listen(port);
  console.log("User service server listening on http://localhost:" + port);
}).catch((err) => {
  console.error("Failed to connect to DB");
  console.error(err);
});
                        

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3002;


// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // MongoDB connection
// mongoose.connect(process.env.DB_CLOUD_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log("Connected to MongoDB"))
// .catch((err) => console.log(err));

// // Define User Schema
// const questionSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   categories: String,
//   complexity: String,
//   link: String,
// });

// const Question = mongoose.model("Question", questionSchema);

// // Routes
// // Create a new question
// app.post("/questions", async (req, res) => {
//   const { title, description, categories, complexity, link } = req.body;

//   const newQuestion = new Question({ title, description, categories, complexity, link});

//   try {
//     await newQuestion.save();
//     res.status(201).send("Question created successfully!");
//   } catch (err) {
//     res.status(500).send("Error creating question.");
//   }
// });

// // Get all questions
// app.get("/questions", async (req, res) => {
//   try {
//     const questions = await Question.find();
//     res.status(200).json(questions);
//   } catch (err) {
//     res.status(500).send("Error fetching question.");
//   }
// });

// // Get a question by ID
// app.get("/questions/:id", async (req, res) => {
//   try {
//     const question = await Question.findById(req.params.id);
//     if (!question) return res.status(404).send("Question not found.");
//     res.status(200).json(question);
//   } catch (err) {
//     res.status(500).send("Error fetching question.");
//   }
// });


// // Update a question by ID
// app.put("/questions/:id", async (req, res) => {
//   try {
//     const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updatedQuestion) return res.status(404).send("Question not found.");
//     res.status(200).json(updatedQuestion);
//   } catch (err) {
//     res.status(500).send("Error updating question.");
//   }
// });

// // Delete a question by ID
// app.delete("/questions/:id", async (req, res) => {
//   try {
//     const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
//     if (!deletedQuestion) return res.status(404).send("Question not found.");
//     res.status(200).send("Question deleted successfully!");
//   } catch (err) {
//     res.status(500).send("Error deleting question.");
//   }
// });

// // Start server
// app.listen(3002, () => {
//   console.log("Server running on port 3002");
// });

