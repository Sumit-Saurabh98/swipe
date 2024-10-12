
import User from "../models/User.js";
import Message from "../models/Message.js";
import { Request, Response } from "express";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const {content, receiverId} = req.body;

        const newMessage = await Message.create({
            senderId: req.user._id,
            receiverId,
            content
        })

        // Send the message in real time

        const io = getIO();

        const connectedUsers = getConnectedUsers();
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", {
                message: newMessage
            });
        }

        res.status(201).json({ success: true, message: newMessage });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getConversation = async (req: Request, res: Response) => {
    const {userId} = req.params;
    try {
        const messages = await Message.find({
            $or: [
                {senderId: req.user._id, receiverId: userId},
                {senderId: userId, receiverId: req.user._id},
            ]
        }).sort({createdAt: 1});

        res.status(200).json({ success: true, messages });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}