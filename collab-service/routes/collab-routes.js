import express from "express";

import { verifyAccessToken } from "../middleware/basic-access-control.js";
import { produceCollabQueue, deleteCollabById, findCollabById, findCollabByMatchUuid, findCollabsByQuestionId, findCollabsByUserId, getAllCollabs, updateCollabById } from "../controller/collab-controller.js";

const router = express.Router();

router.post("/create-collab", verifyAccessToken, produceCollabQueue);
router.get("/all", verifyAccessToken, getAllCollabs);
router.get("/id/:id", verifyAccessToken, findCollabById);
router.get("/userId/:userId", verifyAccessToken, findCollabsByUserId);
router.get("/questionId/:questionId", verifyAccessToken, findCollabsByQuestionId);
router.get("/matchUuid/:matchUuid", verifyAccessToken, findCollabByMatchUuid);
router.patch("/id/:id", verifyAccessToken, updateCollabById);
router.delete("/id/:id", verifyAccessToken, deleteCollabById);

export default router;