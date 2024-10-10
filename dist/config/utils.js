import jwt from "jsonwebtoken";
export const signToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
export const strongPassword = (password) => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\*])(?=.{8,})/;
    if (!passwordPattern.test(password) && password.length != 8) {
        return false;
    }
    return true;
};
