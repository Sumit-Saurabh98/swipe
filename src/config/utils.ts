import jwt from "jsonwebtoken";

export const signToken = (_id: string) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const strongPassword = (password: string): boolean => {
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\*])(?=.{8,})/;

  if (!passwordPattern.test(password) && password.length != 8) {
    return false;
  }
  return true;
};