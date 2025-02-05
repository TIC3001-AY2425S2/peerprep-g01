import express from "express";

import {
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  findQuestion,
  findQuestionById,
  findQuestionByContent,
  findQuestionByDifficulty,
  findQuestionByName,
  updateQuestion
} from "../controller/question-controller.js";
import { verifyAccessToken, verifyIsAdmin, verifyIsOwnerOrAdmin } from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, getAllQuestions);

router.get("/:term", verifyAccessToken, findQuestion);

router.get("/id/:id", verifyAccessToken, findQuestionById);

router.get("/content/:content", verifyAccessToken, findQuestionByContent));

router.get("/difficulty/:difficulty", verifyAccessToken, findQuestionByDifficulty));

router.get("/name/:name", verifyAccessToken, findQuestionByName));

router.post("/", verifyAccessToken, verifyIsOwnerOrAdmin, createQuestion);

router.patch("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, updateQuestion);

router.delete("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, deleteQuestion);

export default router;
