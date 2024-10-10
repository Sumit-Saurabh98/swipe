import express from 'express';
import { signup, login, logout } from "../controllers/authController.js";
import protectRoute from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup as express.RequestHandler);
router.post('/login', login as express.RequestHandler);
router.post('/logout', protectRoute, logout as express.RequestHandler);

export default router;