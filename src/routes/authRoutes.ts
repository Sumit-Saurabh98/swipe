import express, {Response} from 'express';
import { signup, login, logout } from "../controllers/authController.js";
import protectRoute, { CustomRequest } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup as express.RequestHandler);
router.post('/login', login as express.RequestHandler);
router.post('/logout', protectRoute, logout as express.RequestHandler);

router.get("/me", protectRoute, (req:CustomRequest, res:Response) => {
	res.send({
		success: true,
		user: req.user,
	});
});

export default router;