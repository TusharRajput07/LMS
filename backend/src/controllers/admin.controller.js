const User = require("../models/User");
const Book = require("../models/Book");
const IssueRequest = require("../models/IssueRequest");

// -----------------------------------------------------------------------------------------
// admin dashboard

const getDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });
    const pendingRequests = await IssueRequest.countDocuments({
      status: "pending",
    });
    const approvedIssues = await IssueRequest.countDocuments({
      status: "approved",
    });
    const returnRequested = await IssueRequest.countDocuments({
      status: "return_requested",
    });
    const overdueBooks = await IssueRequest.countDocuments({
      status: "approved",
      dueDate: { $lt: new Date() },
    });

    return res.status(200).json({
      totalBooks,
      totalUsers,
      pendingRequests,
      approvedIssues,
      returnRequested,
      overdueBooks,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = { getDashboardStats };
