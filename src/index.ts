import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import {createServer} from "http"
import cookieParser from "cookie-parser";
import authRoutes from"./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import connectDB from "./config/db.js";
import { initializeSocket } from "./socket/socket.server.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5002;

initializeSocket(httpServer);



app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.get("/", (req:Request, res:Response) => {
    res.status(200).json({ message: "Server is running" });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);

httpServer.listen(PORT, () => {
    connectDB();
    console.log(`Listening on port ${PORT}`);
});