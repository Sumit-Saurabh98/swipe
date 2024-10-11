import { Server } from "socket.io";
import http from "http";

declare module 'socket.io' {
    interface Socket {
        userId: string;
    }
}

let io: Server | undefined;

const connectedUsers = new Map();

export const initializeSocket = (httpServer: http.Server) => {
    
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true
        }
    });

    io.use((socket, next) =>{
        const userId = socket.handshake?.auth?.userId;
        if(!userId){
            return next(new Error("invalid user id"));
        }

        socket.userId = userId;
        next();
    })

    io.on("connection", (socket) =>{
        console.log(`User connected with socket id: ${socket.id}`);
        connectedUsers.set(socket.userId, socket.id);

        socket.on("disconnect", () => {
            console.log(`User disconnected with socket id: ${socket.id}`);
            connectedUsers.delete(socket.userId);
        })
    })
}

export const getIO = () =>{
    if(!io){
        throw new Error("socket.io is not initialized")
    }

    return io;
}

export const getConnectedUsers = () =>connectedUsers;