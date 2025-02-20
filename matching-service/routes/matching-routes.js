import express from "express";

import {
  createMatch,
  findRandomMatch,
  getTicket
  
} from "../controller/matching-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";

const router = express.Router();

router.post("/create-match", verifyAccessToken, createMatch);
router.get("/find-match/:category/:complexity", verifyAccessToken, findRandomMatch);
router.get("/ticket", verifyAccessToken, getTicket)
//router.get("/find-match/:id", verifyAccessToken, findMatch);

export default router;