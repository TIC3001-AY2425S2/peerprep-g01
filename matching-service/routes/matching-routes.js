import express from "express";

import {
  createMatch,
  findMatch
  
} from "../controller/matching-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";

const router = express.Router();

router.post("/createMatch", verifyAccessToken, createMatch);
router.get("/findMatch/:matchChannel", verifyAccessToken, findMatch);

export default router;