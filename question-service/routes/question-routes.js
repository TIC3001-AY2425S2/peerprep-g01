import express from "express";

import {
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  findQuestionByText as findQuestionByText,
  findQuestionById,
  findQuestionByDescription,
  findQuestionByComplexity,
  findQuestionByTitle,
  findQuestionByCategory,
  updateQuestion
} from "../controller/question-controller.js";
import { verifyAccessToken, verifyIsAdmin } from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, getAllQuestions);

router.get("/text/:text", verifyAccessToken, findQuestionByText);

router.get("/id/:id", verifyAccessToken, findQuestionById);

router.get("/description/:description", verifyAccessToken, findQuestionByDescription);

router.get("/category/:category", verifyAccessToken, findQuestionByCategory);

router.get("/complexity/:complexity", verifyAccessToken, findQuestionByComplexity);

router.get("/title/:title", verifyAccessToken, findQuestionByTitle);

router.post("/", verifyAccessToken, verifyIsAdmin, createQuestion);

router.patch("/:id", verifyAccessToken, verifyIsAdmin, updateQuestion);

router.delete("/:id", verifyAccessToken, verifyIsAdmin, deleteQuestion);

export default router;
