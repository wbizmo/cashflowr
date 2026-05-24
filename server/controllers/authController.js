import bcrypt from "bcryptjs";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (
  req,
  res
) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
    } = req.body;

    const userExists =
      await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),

      user: {
        id: user._id,
        firstName:
          user.firstName,
        lastName:
          user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (
  req,
  res
) => {
  try {
    const { email, password } =
      req.body;

    const user =
      await User.findOne({ email });

    if (
      !user ||
      !(await bcrypt.compare(
        password,
        user.password
      ))
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),

      user: {
        id: user._id,
        firstName:
          user.firstName,
        lastName:
          user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};