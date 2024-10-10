import User from "../models/User.js";
import { signToken } from "../config/utils.js";
import { strongPassword } from "../config/utils.js";
export const signup = async (req, res) => {
    const { name, email, password, age, gender, genderPreference } = req.body;
    try {
        if (!name || !email || !password || !age || !gender || !genderPreference) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (age < 18) {
            return res
                .status(400)
                .json({ message: "You must be at least 18 years old" });
        }
        if (!strongPassword(password)) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters, including at least 1 number and 1 includes both lower and uppercase letters and special characters for example #,?,!",
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        const newUser = await User.create({
            name,
            email,
            password,
            age,
            gender,
            genderPreference,
        });
        const token = signToken(newUser._id.toString());
        res.cookie("_swipe_access_token", token, {
            httpOnly: true, // prevent XSS attacks
            sameSite: "strict", // prevent CSRF attacks
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            success: true,
            user: newUser,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = signToken(user._id.toString());
        res.cookie("_swipe_access_token", token, {
            httpOnly: true, // prevent XSS attacks
            sameSite: "strict", // prevent CSRF attacks
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            message: "Logged in successfully",
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const logout = async (req, res) => {
    try {
        res.cookie("_swipe_access_token", "", {
            httpOnly: true, // prevent XSS attacks
            sameSite: "strict", // prevent CSRF attacks
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
