import { isValidObjectId } from "mongoose";
import {
  createQuestion as _createQuestion,
  getQuestions as _getQuestions,
  findQuestionByExactTitle as _findQuestionByExactTitle,
  findQuestionByLikeTitle as _findQuestionByLikeTitle,
  findQuestionByDescription as _findQuestionByDescription,
  findQuestionByComplexity as _findQuestionByComplexity,
  findQuestionByCategory as _findQuestionByCategory,
  findQuestionById as _findQuestionById,
  findQuestionByText as _findQuestionByText,
  updateQuestionById as _updateQuestionById,
  deleteQuestionById as _deleteQuestionById,
  getAllCategories as _getAllCategories,
  findQuestionByFilter as _findQuestionByFilter
} from "../model/repository.js";

export async function createQuestion(req, res) {
    try {
        const { title, description, complexity, categories, link } = req.body;
        if (!(title, description, complexity, categories)){
            return res.status(400).json({ message: "title or description or complexity or categories missing" }); 
        }
        let title_trim = title.trim()
        const isQuestionExists = await _findQuestionByExactTitle(title_trim);
        if (isQuestionExists) {
            return res.status(409).json({ message: "Question title already exists" });
        }
        const newCategories = processCategoriesToArray(categories);
        const createdQuestion = await _createQuestion(title_trim, description, complexity, newCategories, link);
        return res.status(201).json({
            message: `Success`,
            data: formatQuestionResponse(createdQuestion),
        });
    } 
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}

export async function findQuestionByText(req, res) {
    try {
        const text = req.params.text;
        const questions = await _findQuestionByText(text)
        return res.status(200).json({ message: `Success`, data: questions.map(formatQuestionResponse) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
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
        return res.status(500).json({ message: err.message });
    }
}

export async function findQuestionByDescription(req, res) {
    try {
        const description = req.params.description;
        const questions = await _findQuestionByDescription(description)
        return res.status(200).json({ message: `Success`, data: questions.map(formatQuestionResponse) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}

export async function findQuestionByTitle(req, res) {
    try {
        const title = req.params.title;
        const questions = await _findQuestionByLikeTitle(title)
        return res.status(200).json({ message: `Success`, data: questions.map(formatQuestionResponse) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}

export async function findQuestionByComplexity(req, res) {
    try {
        const complexity = req.params.complexity;
        const questions = await _findQuestionByComplexity(complexity)
        return res.status(200).json({ message: `Success`, data: questions.map(formatQuestionResponse) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}

export async function findQuestionByCategory(req, res) {
    try {
        const category = req.params.category;
        const questions = await _findQuestionByCategory(category)
        return res.status(200).json({ message: `Success`, data: questions.map(formatQuestionResponse) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}

export async function findQuestionByFilter(req, res){
    try{
        const category = req.query.category;
        const complexity = req.query.complexity
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}

export async function getQuestions(req, res) {
    try {
        const { category, complexity } = req.query; // Extract query parameters
        if (! (category && complexity)){
            const questions = await _getQuestions();
            return res.status(200).json({ message: `Success`, data: questions.map(formatQuestionResponse) });
        }
        else if (category && complexity) {
            let filter = {}
            filter.category = category;
            filter.complexity = complexity;
            const questions = await _findQuestionByFilter(filter);
            return res.status(200).json({ message: `Success`, data: questions});
        }       
        else{
            return res.status(404).json({ message: `No questions`})
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}

export async function getAllCategories(req, res){
    try{
        const categories = await _getAllCategories();
        return res.status(200).json({ message: `Success`, data: categories });
    }
    catch (err){
        console.error(err)
        return res.status(500).json({ message: "Error getting all categories" });
    }
}

export async function updateQuestion(req, res) {
    try {
        const { title, description, complexity, categories, link } = req.body;
        if (!(title || description || complexity || categories || link)) {
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
        if (title) {
            let existingQuestion = await _findQuestionByExactTitle(title);
            if (existingQuestion && existingQuestion.id !== id) {
                return res.status(409).json({ message: "Question title already exists" });
            }
        }

        const newCategories = processCategoriesToArray(categories);
        const updatedQuestion = await _updateQuestionById(id, title, description, complexity, newCategories, link);
        return res.status(200).json({
            message: `Success`,
            data: formatQuestionResponse(updatedQuestion),
        });
    }
    catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: err.message });
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
        return res.status(500).json({ message: err.message });
    }
}

export function formatQuestionResponse(question) {
    let description = question.description
    // if(description){
    //     description = description.length > 30 ? description.slice(0, 40) + "..." : description;
    // }
    
    return {
        _id: question.id,
        title: question.title,
        description: description,
        complexity: question.complexity,
        categories: question.categories,
        createdAt: question.createdAt,
        link: question.link
    };
}

/*
  the question json is sent to the front-end in JSON format. But when updating or creating new questions, the categories is submitted in different format
  Hence, this hack is used to process the categories to an array format
*/
function processCategoriesToArray(categories){
  let processed = [];
  console.log(categories);

  if(Array.isArray(categories)){
    console.log("newCateprocessedgories: ", categories);
    processed.push(...(categories[0].split(',')));
  }

  else if(categories.includes(',')){
    console.log("processed: ", categories);
    processed.push(...(categories.split(',')));
  }

  else{
    processed.push(categories);
  }

  let trimmed = processed.map(word => word.trim());
  console.log("trimmed: ", trimmed);
  return trimmed;
}