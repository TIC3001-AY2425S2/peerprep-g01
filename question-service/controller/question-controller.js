import bcrypt from "bcrypt";
import { isValidObjectId } from "mongoose";
import {
  createQuestion as _createQuestion,
  getQuestions as _getQuestions,
  findQuestionByExactTitle as _findQuestionByExactTitle,
  findQuestionByLikeTitle as _findQuestionByLikeTitle,
  findQuestionByDescription as _findQuestionByDescription,
  findQuestionByComplexity as _findQuestionByComplexity,
  findQuestionById as _findQuestionById,
  findQuestionByTerm as _findQuestionByTerm,
  updateQuestionById as _updateQuestionById,
  deleteQuestionById as _deleteQuestionById
} from "../model/repository.js";

export async function createQuestion(req, res) {
    try {
        const { title, description, complexity, categories } = req.body;
        if (!(title, description, complexity, categories)){
            return res.status(400).json({ message: "title or description or complexity or categories missing" }); 
        }
        const isQuestionExists = await _findQuestionByExactTitle(title);
        if (isQuestionExists) {
            return res.status(409).json({ message: "Question title already exists" });
        }
        const createdQuestion = await _createQuestion(title, description, complexity, categories);
        return res.status(201).json({
            message: `Success`,
            data: formatQuestionResponse(createdQuestion),
        });
    } 
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unknown error" });
    }
}

export async function findQuestionByTerm(req, res) {
    try {
        const term = req.params.term;
        const question = await _findQuestionByTerm(term)
        if (!question){
            return res.status(404).json({ message: `Not found` });
        }
        return res.status(200).json({ message: `Success`, data: formatQuestionResponse(question) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Unknown error` });
    }
}

export async function findQuestionById(req, res) {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) {
            return res.status(404).json({ message: `Not found` });
        }
        const question = await _findQuestionById(id)
        if (!question){
            return res.status(404).json({ message: `Not found` });
        }
        return res.status(200).json({ message: `Success`, data: formatQuestionResponse(question) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Unknown error` });
    }
}

export async function findQuestionByDescription(req, res) {
    try {
        const description = req.params.description;
        const question = await _findQuestionByDescription(description)
        if (!question){
            return res.status(404).json({ message: `Not found` });
        }
        return res.status(200).json({ message: `Success`, data: formatQuestionResponse(question) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Unknown error` });
    }
}

export async function findQuestionByTitle(req, res) {
    try {
        const title = req.params.title;
        const question = await _findQuestionByLikeTitle(title)
        if (!question){
            return res.status(404).json({ message: `Not found` });
        }
        return res.status(200).json({ message: `Success`, data: formatQuestionResponse(question) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Unknown error` });
    }
}

export async function findQuestionByComplexity(req, res) {
    try {
        const complexity = req.params.complexity;
        const question = await _findQuestionByComplexity(difficulty)
        if (!question){
            return res.status(404).json({ message: `Not found` });
        }
        return res.status(200).json({ message: `Success`, data: formatQuestionResponse(question) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Unknown error` });
    }
}

export async function getAllQuestions(req, res) {
    try {
        const questions = await _getQuestions();
        return res.status(200).json({ message: `Success`, data: questions.map(formatQuestionResponse) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unknown error" });
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
            return res.status(404).json({ message: `Id not found` });
        }
        const question = await _findQuestionById(id);
        if (!question) {
            return res.status(404).json({ message: `Id not found` });
        }
        if (name) {
            let existingQuestion = await _findQuestionByName(name);
            if (existingQuestion && existingQuestion.id !== id) {
                return res.status(409).json({ message: "Question name already exists" });
            }
        }
        const updatedQuestion = await _updateQuestionById(id, name, content, difficulty, topic);
        return res.status(200).json({
            message: `Success`,
            data: formatQuestionResponse(updatedQuestion),
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unknown error" });
    }
}

export async function deleteQuestion(req, res) {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) {
            return res.status(404).json({ message: `Id not found` });
        }
        const question = await _findQuestionById(id);
        if (!question) {
            return res.status(404).json({ message: `Id not found` });
        }
        await _deleteQuestionById(id);
        return res.status(200).json({ message: `Success` });
    } 
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unknown error" });
    }
}

export function formatQuestionResponse(question) {
    let content = question.content
    if(content){
        content = content.length > 30 ? content.slice(0, 40) + "..." : content;
    }
    
    return {
        id: question.id,
        username: question.name,
        content: content,
        difficulty: question.difficulty,
        topics: question.topics,
        createdAt: question.createdAt,
    };
}
