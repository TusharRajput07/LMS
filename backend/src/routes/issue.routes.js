const express = require("express");
const router = express.Router();
const {
  requestIssue,
  getMyIssues,
  requestReturn,
  cancelRequest,
  getAllIssues,
  approveRequest,
  rejectRequest,
  confirmReturn,
} = require("../controllers/issue.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// User routes
router.post("/request/:bookId", verifyToken, requestIssue);
router.get("/my", verifyToken, getMyIssues);
router.post("/return/:issueId", verifyToken, requestReturn);
router.delete("/cancel/:issueId", verifyToken, cancelRequest);

// Admin routes
router.get("/", verifyToken, verifyAdmin, getAllIssues);
router.patch("/approve/:issueId", verifyToken, verifyAdmin, approveRequest);
router.patch("/reject/:issueId", verifyToken, verifyAdmin, rejectRequest);
router.patch(
  "/confirm-return/:issueId",
  verifyToken,
  verifyAdmin,
  confirmReturn,
);

module.exports = router;
