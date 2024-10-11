import { Response } from "express";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import { CustomRequest } from "../middleware/auth.js";

export const updateProfile = async (req: CustomRequest, res: Response) => {
  try {
    const { image, ...otherData } = req.body;

    let updatedData = otherData;

    if (image) {
      // base64 format
      if (image.startsWith("data:image")) {
        try {
            const uploadedResponse = await cloudinary.uploader.upload(image);
            updatedData = { ...otherData, image: uploadedResponse.secure_url };
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Error uploading image" });
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updatedData,
      { new: true }
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
