const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/admin.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

router.get("/dashboard", verifyToken, verifyAdmin, getDashboardStats);

module.exports = router;
