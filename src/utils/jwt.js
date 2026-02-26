import jwt from "jsonwebtoken";
import process from "process";

const DEFAULT_EXPIRES_IN = "7d"; // 7 days default expiration

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    throw error;
  }
};

// for 2FA
export const createSecretToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};


export const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
