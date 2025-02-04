import bcrypt from "bcrypt";
import { isValidObjectId } from "mongoose";
import {
  createQuestion as _createQuestion,
  getAllQuestions as _getAllQuestions,
  findQuestionByName as _findQuestionByName,
  findQuestionByContent as _findQuestionByContent,
  findQuestionByDifficulty as _findQuestionByDifficulty,
  findQuestionById as _findQuestionById,
  updateQuestionById as _updateQuestionById,
} from "../model/repository.js";

export async function createQuestion(req, res) {
    try {
        const { name, content, difficulty, topic } = req.body;
        if (name && content && difficulty && topic) {
            const existingQuestion = await _findQuestionBySpecificName(name);
            if (existingQuestion) {
                return res.status(409).json({ message: "question name already exists" });
            }
            const createdQuestion = await _createQuestion(name, content, difficulty, topic);
            return res.status(201).json({
                message: `Created new question "${name}" successfully`,
                data: formatQuestionResponse(createdQuestion),
            });
        } 
        else {
            return res.status(400).json({ message: "name or content or difficulty or topic missing" });
        }
    } 
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unknown error when creating new question" });
    }
}

export async function findQuestionByName(req, res) {
    try {
        const name = req.params.name;
        if (!isValidObjectId(name)) {
            return res.status(404).json({ message: `Question "${name}" not found` });
        }
        const question = await _findQuestionBySpecificName(name);
        if (!question) {
            return res.status(404).json({ message: `Question "${name}" not found` });
        }
        else {
            return res.status(200).json({ message: `Found question`, data: formatQuestionResponse(question) });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unknown error when getting question by name" });
    }
}

export async function getAllQuestions(req, res) {
    try {
        const questions = await _getAllQuestions();
        return res.status(200).json({ message: `Found questions`, data: questions.map(formatQuestionResponse) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unknown error when getting all questions" });
    }
}

export async function updateQuestion(req, res) {
    try {
        const { name, content, difficulty, topic } = req.body;
        if (!(name || content || difficulty || topic)) {
            return res.status(400).json({ message: "No field to update" });
        }
        const id = req.params.id;
        if (!isValidObjectId(id)) {
            return res.status(404).json({ message: `Question id parameter not found` });
        }
        const question = await _findQuestionById(id);
        if (!question) {
            return res.status(404).json({ message: `Question ${id} not found` });
        }
        if (name) {
            let existingQuestion = await _findQuestionByName(name);
            if (existingQuestion && existingQuestion.id !== id) {
                return res.status(409).json({ message: "Question name already exists" });
            }
        }
        const updatedQuestion = await _updateQuestionById(id, name, content, difficulty, topic);
        return res.status(200).json({
            message: `Updated data for question ${id}`,
            data: formatQuestionResponse(updatedQuestion),
        });
    }
    else {
        return res.status(400).json({ message: "No field to update" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unknown error when updating question" });
    }
}

export async function deleteQuestion(req, res) {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) {
            return res.status(404).json({ message: `Question id parameter not found` });
        }
        const question = await _findQuestionById(id);
        if (!question) {
            return res.status(404).json({ message: `Question ${id} not found` });
        }
        await _deleteQuestionById(id);
        return res.status(200).json({ message: `Deleted question ${id} successfully` });
    } 
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unknown error when deleting question" });
    }
}

export function formatQuestionResponse(question) {
  const trimmedContent = str.length > 30 ? str.slice(0, 30) + "..." : str;
  return {
    id: question.id,
    username: question.name,
    content: trimmedContent,
    diffiuclty: question.difficulty,
    topics: question.topics,
    createdAt: question.createdAt,
  };
}
