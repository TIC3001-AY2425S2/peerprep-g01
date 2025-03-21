import express from "express";

import {
  //createMatch,
  findMatchByCategoryComplexity,
  findRandomMatch,
  syncWithRoomHost,
  syncWithRoomPartner,
  //waitMatch
  
} from "../controller/matching-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";

const router = express.Router();

// router.post("/create-match", verifyAccessToken, createMatch);
// router.get("/find-match/:category/:complexity", verifyAccessToken, findRandomMatch);
router.get("/find-match/:category/:complexity", verifyAccessToken, findMatchByCategoryComplexity);
router.get("/sync-with-room-partner", verifyAccessToken, syncWithRoomPartner);
router.get("/sync-with-room-host/:roomHostId", verifyAccessToken, syncWithRoomHost);
//router.get("/wait-match/:id", verifyAccessToken, waitMatch);
//router.get("/find-match/:id", verifyAccessToken, findMatch);

export default router;