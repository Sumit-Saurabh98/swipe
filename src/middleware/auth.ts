import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { Response, Request, NextFunction } from "express";

export interface CustomRequest extends Request {
  user?: any; 
}

const protectRoute = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies._swipe_access_token;

    if (!token) {
      res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
      return; 
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      _id: string;
    };

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - invalid token provided",
      });
      return; 
    }

    const user = await User.findById(decoded._id);

    if (!user) {
      res.status(401).json({ message: "Unauthorized - user not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in auth middleware :- ", error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: "Unauthorized - invalid token provided" });
    } else {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
    return;
  }
};

export default protectRoute;