import express from "express";

import {
  
  
} from "../controller/collab-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";
import { createCollab, deleteCollabById, findCollabById, findCollabsByMatchUuid, findCollabsByQuestionId, findCollabsByUserId, getAllCollabs, updateCollabById } from "../model/repository.js";

const router = express.Router();

router.post("/create-collab", verifyAccessToken, createCollab);
router.get("/all", verifyAccessToken, getAllCollabs);
router.get("/id/:id", verifyAccessToken, findCollabById);
router.get("/userId/:userId", verifyAccessToken, findCollabsByUserId);
router.get("/questionId/:questionId", verifyAccessToken, findCollabsByQuestionId);
router.get("/matchUuid/:matchUuid", verifyAccessToken, findCollabsByMatchUuid);
router.update("/id/:id", verifyAccessToken, updateCollabById);
router.delete("/id/:id", verifyAccessToken, deleteCollabById);

export default router;