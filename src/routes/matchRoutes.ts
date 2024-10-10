import express from "express";
import protectRoute from "../middleware/auth.js";
import { getMatches, getUserProfiles, swipeLeft, swipeRight } from "../controllers/matchController.js";

const router = express.Router();

router.post('/swipe-right/:likedUserId', protectRoute, swipeRight as express.RequestHandler);
router.post('/swipe-left/:dislikedUserId', protectRoute, swipeLeft as express.RequestHandler);
router.get('/', protectRoute, getMatches as express.RequestHandler);
router.get('/user-profiles', protectRoute, getUserProfiles as express.RequestHandler);

export default router