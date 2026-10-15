import jwt from "jsonwebtoken";
import User from "../models/customer.model.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers?.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: "no token found" });
    }

    const check = jwt.verify(token, process.env.jwtSecret);
    const userdetail = await User.findById(check.userId);

    if (!userdetail) {
      return res.status(401).json({ message: "account does not exist" });
    }

    req.user = userdetail;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized or invalid token" });
  }
};