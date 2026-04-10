const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  refreshToken,
  logout,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth");

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh", refreshToken);
router.post("/logout", verifyToken, logout); // contains verifytoken (user must be logged in)

module.exports = router;
