import { CustomRequest } from "../middleware/auth.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { Response } from "express";

export const sendMessage = async (req: CustomRequest, res: Response) => {
    try {
        const {content, receiverId} = req.body;

        const newMessage = await Message.create({
            senderId: req.user._id,
            receiverId,
            content
        })

        // TODO: Send the message in real time

        res.status(201).json({ success: true, message: newMessage });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getConversation = async (req: CustomRequest, res: Response) => {
    const {userId} = req.params;
    try {
        const messages = await Message.find({
            $or: [
                {sender: req.user._id, receiver: userId},
                {sender: userId, receiver: req.user._id},
            ]
        }).sort({createdAt: 1});

        res.status(200).json({ success: true, messages });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}