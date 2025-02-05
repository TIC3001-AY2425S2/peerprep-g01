import bcrypt from "bcrypt";
import { isValidObjectId } from "mongoose";
import {
  createQuestion as _createQuestion,
  getQuestion as _getQuestion,
  findQuestionByName as _findQuestionByName,
  findQuestionByContent as _findQuestionByContent,
  findQuestionByDifficulty as _findQuestionByDifficulty,
  findQuestionById as _findQuestionById,
  findQuestions as _findQuestions,
  updateQuestionById as _updateQuestionById,
  deleteQuestionById as _deleteQuestionById
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

export async function findQuestion(req, res) {
    try {
        const term = req.params.term;
        if (!isValidObjectId(term)) {
            return res.status(404).json({ message: `Question search parameter not found` });
        }
        const question = await _findQuestions(term)
        if (!question){
            return res.status(404).json({ message: `Questions with term "${term}" not found` });
        }
        return res.status(200).json({ message: `Found questions with term "${term}"`, data: formatQuestionResponse(question) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Unknown error when finding question by term "${term}"` });
    }
}

export async function findQuestionById(req, res) {
    try {
        const term = req.params.id;
        if (!isValidObjectId(term)) {
            return res.status(404).json({ message: `Question search id parameter not found` });
        }
        const question = await _findQuestions(term)
        if (!question){
            return res.status(404).json({ message: `Question with id "${term}" not found` });
        }
        return res.status(200).json({ message: `Found questions with id "${term}"`, data: formatQuestionResponse(question) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Unknown error when finding question by id "${term}"` });
    }
}

export async function findQuestionByContent(req, res) {
    try {
        const term = req.params.content;
        if (!isValidObjectId(term)) {
            return res.status(404).json({ message: `Question search content parameter not found` });
        }
        const question = await _findQuestions(term)
        if (!question){
            return res.status(404).json({ message: `Question with content "${term}" not found` });
        }
        return res.status(200).json({ message: `Found questions with content "${term}"`, data: formatQuestionResponse(question) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Unknown error when finding question by content "${term}"` });
    }
}

export async function findQuestionByName(req, res) {
    try {
        const term = req.params.name;
        if (!isValidObjectId(term)) {
            return res.status(404).json({ message: `Question search name parameter not found` });
        }
        const question = await _findQuestions(term)
        if (!question){
            return res.status(404).json({ message: `Question with name "${term}" not found` });
        }
        return res.status(200).json({ message: `Found questions with name "${term}"`, data: formatQuestionResponse(question) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Unknown error when finding question by name "${term}"` });
    }
}

export async function findQuestionByDifficulty(req, res) {
    try {
        const term = req.params.difficulty;
        if (!isValidObjectId(term)) {
            return res.status(404).json({ message: `Question search difficulty parameter not found` });
        }
        const question = await _findQuestions(term)
        if (!question){
            return res.status(404).json({ message: `Question with difficulty "${term}" not found` });
        }
        return res.status(200).json({ message: `Found questions with difficulty "${term}"`, data: formatQuestionResponse(question) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Unknown error when finding question by difficulty "${term}"` });
    }
}

export async function getAllQuestions(req, res) {
    try {
        const questions = await _getQuestions();
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
            return res.status(404).json({ message: `Question id ${id} not found` });
        }
        await _deleteQuestionById(id);
        return res.status(200).json({ message: `Deleted question id ${id} successfully` });
    } 
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unknown error when deleting question" });
    }
}

export function formatQuestionResponse(question) {
  const trimmedContent = str.length > 30 ? str.slice(0, 40) + "..." : str;
  return {
    id: question.id,
    username: question.name,
    content: trimmedContent,
    diffiuclty: question.difficulty,
    topics: question.topics,
    createdAt: question.createdAt,
  };
}
