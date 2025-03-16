import express from "express";

import {
  //createMatch,
  findMatchByCategoryComplexity,
  findRandomMatch,
  getTicket,
  waitMatch
  
} from "../controller/matching-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";

const router = express.Router();

// router.post("/create-match", verifyAccessToken, createMatch);
// router.get("/find-match/:category/:complexity", verifyAccessToken, findRandomMatch);
router.get("/find-match/:category/:complexity", verifyAccessToken, findMatchByCategoryComplexity);
router.get("/ticket", verifyAccessToken, getTicket);
router.get("/wait-match/:id", verifyAccessToken, waitMatch);
//router.get("/find-match/:id", verifyAccessToken, findMatch);

export default router;