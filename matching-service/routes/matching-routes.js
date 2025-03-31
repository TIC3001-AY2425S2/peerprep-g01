import express from "express";

import {
  //createMatch,
  matchByCategoryComplexity,
  //waitMatch
  
} from "../controller/matching-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";

const router = express.Router();

// router.post("/create-match", verifyAccessToken, createMatch);
router.post("/find-match/:category/:complexity", verifyAccessToken, matchByCategoryComplexity);
//router.get("/wait-match/:id", verifyAccessToken, waitMatch);
//router.get("/find-match/:id", verifyAccessToken, findMatch);

export default router;