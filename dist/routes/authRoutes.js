import express from 'express';
import { signup, login, logout } from "../controllers/authController.js";
import protectRoute from '../middleware/auth.js';
const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protectRoute, logout);
export default router;
