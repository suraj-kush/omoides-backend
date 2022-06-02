import mongoose from "mongoose";
import user from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    } else {
      const isPasswordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Invalid password" });
      } else {
        const token = jwt.sign(
          {
            email: existingUser.email,
            id: existingUser._id,
          },
          "secret",
          { expiresIn: "1h" }
        );
        return res.status(200).json({ result: existingUser, token });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
};
export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;
  try {
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(404).json({ message: "User Already exists" });
    }
    if (password !== confirmPassword) {
      return res.status(404).json({ message: "Password does not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await user.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });
    const token = jwt.sign(
      {
        email: result.email,
        id: result._id,
      },
      "secret",
      { expiresIn: "1h" }
    );
    res.status(200).json({ result, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
};
