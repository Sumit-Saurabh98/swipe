import express from "express";
import { getConversation, sendMessage } from "../controllers/messageController.js";
import protectRoute from "../middleware/auth.js";

const router = express.Router();

router.post('/send-message', protectRoute, sendMessage as express.RequestHandler);
router.post('/conversation/:userId', protectRoute, getConversation as express.RequestHandler);


export default router