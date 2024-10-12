import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
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

const __dirname = path.resolve();

initializeSocket(httpServer);



app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "/client/build")));
    app.get("*", (req: Request, res: Response) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    })
}

httpServer.listen(PORT, () => {
    connectDB();
    console.log(`Listening on port ${PORT}`);
});