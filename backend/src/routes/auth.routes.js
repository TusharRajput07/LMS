const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  refreshToken,
  logout,
  getMe,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth");

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh", refreshToken);
router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, getMe);

module.exports = router;
