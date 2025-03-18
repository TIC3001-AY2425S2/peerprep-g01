import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail as _findUserByEmail, findUserByUsername as _findUserByUsername } from "../model/repository.js";
import { formatUserResponse } from "./user-controller.js";

export async function handleLogin(req, res) {
  const { username, password } = req.body;

  console.log("Request body:", req.body)
  if (username && password) {
    try {
      const user = await _findUserByEmail(username);
      if (!user) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      const accessToken = jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin
      }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      return res.status(200).json({ message: "User logged in", data: { accessToken, ...formatUserResponse(user) } });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(400).json({ message: "Missing email and/or password" });
  }
}

export async function handleVerifyToken(req, res) {
  try {
    const verifiedUser = req.user;
    return res.status(200).json({ message: "Token verified", data: verifiedUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
