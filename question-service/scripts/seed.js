import mongoose from 'mongoose';
import fs from 'fs';
import Question from '../model/question-model.js';
import "dotenv/config";

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.DB_CLOUD_URI;
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const questions = JSON.parse(fs.readFileSync('./initial-questions.json', 'utf8'));
    console.log('Loaded questions from file:', questions.questions.length, 'questions found');
    
    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');
    
    // Insert new questions
    const result = await Question.insertMany(questions.questions);
    console.log('Inserted questions:', result.length);
    
    console.log('Database seeded successfully');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Call the function
seedDatabase(); 