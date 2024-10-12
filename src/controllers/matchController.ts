import { Request, Response } from "express";
import User from "../models/User.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";

export const swipeRight = async (req: Request, res: Response) => {
  try {
    const { likedUserId } = req.params;
    const currentUser = await User.findById(req.user._id);
    const likedUser = await User.findById(likedUserId);

    if (!likedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!currentUser?.likes.includes(likedUserId as any)) {
      currentUser?.likes.push(likedUserId as any);
      await currentUser?.save();

      // if the other user already liked us, it's a match, so lets update the both users

      if (likedUser?.likes.includes(currentUser?._id as any)) {
        currentUser?.matches.push(likedUserId as any);
        likedUser?.matches.push(currentUser?._id as any);
        await Promise.all([await currentUser?.save(), await likedUser?.save()]);

        // send notification in real time with socket.io
        const connectedUsers = getConnectedUsers()
        const io = getIO();
        const likedUserSocketId = connectedUsers.get(likedUserId);
        if (likedUserSocketId) {
            io.to(likedUserSocketId).emit("newMatch", {
                _id: currentUser?._id,
                name: currentUser?.name,
                image: currentUser?.image,
            });
        }

        const currentSocketId = connectedUsers.get(currentUser?._id.toString());
        if (currentSocketId) {
            io.to(currentSocketId).emit("newMatch", {
                _id: likedUser?._id,
                name: likedUser?.name,
                image: likedUser?.image,
            });
        }
      }

      res.status(200).json({
        success: true,
        message: "Swiped right successfully",
        user: currentUser,
      });
      
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const swipeLeft = async (req: Request, res: Response) => {
  try {
    const { dislikedUserId } = req.params;

    const currentUser = await User.findById(req.user._id);
    // const dislikedUserObjectId = new Types.ObjectId(dislikedUserId);
    if (!currentUser?.dislikes.includes(dislikedUserId as any)) {
      currentUser?.dislikes.push(dislikedUserId as any);
      await currentUser?.save();
    }

    res.status(200).json({
      success: true,
      message: "Swiped left successfully",
      user: currentUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMatches = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "matches",
      "name image"
    );
    res.status(200).json({ success: true, matches: user?.matches });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUserProfiles = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findById(req.user._id);

    // filter out the profiles that are already not current user or liked or disliked or matched or preference
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUser?._id } },
        { _id: { $nin: currentUser?.likes } },
        { _id: { $nin: currentUser?.dislikes } },
        { _id: { $nin: currentUser?.matches } },
        {
          gender:
            currentUser?.genderPreference === "male"
              ? { $in: ["male"] }
              : currentUser?.genderPreference === "female"
              ? { $in: ["female"] }
              : { $in: ["male", "female"] },
        },
        {
          // gender preference of other user should be same as current user
          // for example jim(male) want to see female profile julia(female), but julia don't want to see male. in that jim won't be able to see julia
          genderPreference: { $in: [currentUser?.gender, "both"] },
        },
      ],
    });

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
