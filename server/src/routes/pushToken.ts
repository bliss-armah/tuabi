import express from "express";
import { authenticateToken } from "../middleware/auth";
import { savePushToken } from "../controllers/pushTokenController";

const router = express.Router();

router.post("/", authenticateToken, savePushToken);

export default router;
