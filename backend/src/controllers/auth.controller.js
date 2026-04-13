const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

// functions just to avoid code repetition
const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// --------------------------------------------------------------------------------------------
// signup
const signup = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // if secret was provided but is wrong, reject it
    if (adminSecret && adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(400).json({ message: "Invalid admin secret" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: adminSecret === process.env.ADMIN_SECRET ? "admin" : "user",
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// -------------------------------------------------------------------------------------------
// signin
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      message: "Signed in successfully",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(`Signin error: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// --------------------------------------------------------------------------------------------
// new access token if refresh token is present
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    // first we verify the refresh token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // then we check if user exists and is the refresh token same
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // then we generate a new access token
    const accessToken = generateAccessToken(user._id, user.role);

    return res.status(200).json({ accessToken });
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
};

// ---------------------------------------------------------------------------------------------
// logout
const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      await User.findOneAndUpdate(
        { refreshToken: token },
        { refreshToken: null },
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------------------------
// get the logged in user
const getMe = async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

module.exports = { signup, signin, refreshToken, logout, getMe };
