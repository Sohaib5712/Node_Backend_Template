import jwt from "jsonwebtoken";
import process from "process";

const DEFAULT_EXPIRES_IN = "7d";

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") throw new Error("Token has expired");
    throw error;
  }
};

// Short-lived token for 2FA and other one-time flows
export const createSecretToken = (payload, expiresIn = "24h") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};
