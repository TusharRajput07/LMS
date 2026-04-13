const IssueRequest = require("../models/IssueRequest");
const Book = require("../models/Book");
const User = require("../models/User");
const logger = require("../config/logger");

// ------------------------------------------------------------------------------------------
// request to issue a book (user)
const requestIssue = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id; // logged in user

    // book should exist
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // book should be in stock
    if (book.availableStock === 0) {
      return res.status(400).json({ message: "Book is out of stock" });
    }

    // user should not already have a pending/approved request for this book
    const existingRequest = await IssueRequest.findOne({
      user: userId,
      book: bookId,
      status: { $in: ["pending", "approved", "return_requested"] },
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You already have an active request for this book" });
    }

    // user should not already have >= 7 approved books
    const approvedBooks = await IssueRequest.countDocuments({
      user: userId,
      status: "approved",
    });
    if (approvedBooks >= 7) {
      return res
        .status(400)
        .json({ message: "You cannot issue more than 7 books at a time" });
    }

    // everything good
    const issueRequest = new IssueRequest({
      user: userId,
      book: bookId,
      status: "pending",
    });

    await issueRequest.save();

    return res.status(201).json({
      message: "Issue request submitted successfully",
      issueRequest,
    });
  } catch (error) {
    logger.error(`Request issue error: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ------------------------------------------------------------------------------------------
// get my issued books (user)
const getMyIssues = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = { user: req.user._id };
    if (status) filter.status = status;

    const issues = await IssueRequest.find(filter)
      .populate("book", "title author genre availableStock")
      .sort({ createdAt: -1 });

    return res.status(200).json({ total: issues.length, issues });
  } catch (error) {
    logger.error(`Get my issues error: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ------------------------------------------------------------------------------------------
// initiate return request (user)
const requestReturn = async (req, res) => {
  try {
    const issue = await IssueRequest.findById(req.params.issueId);

    if (!issue) {
      return res.status(404).json({ message: "Issue request not found" });
    }

    // this issue should only belong to the logged in user
    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // the status should only be "approved" for a return request
    if (issue.status !== "approved") {
      return res
        .status(400)
        .json({ message: "Only approved books can be returned" });
    }

    issue.status = "return_requested";
    await issue.save();

    return res.status(200).json({
      message: "Return request submitted. Waiting for admin confirmation.",
      issue,
    });
  } catch (error) {
    logger.error(`Request return error: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ------------------------------------------------------------------------------------------
// get all issue requests (admin)
const getAllIssues = async (req, res) => {
  try {
    const { status } = req.query; // admin will have the option of filtering the issues on dashboard

    let filter = {};
    if (status) filter.status = status;

    const issues = await IssueRequest.find(filter)
      .populate("user", "name email")
      .populate("book", "title author")
      .sort({ createdAt: -1 });

    return res.status(200).json({ total: issues.length, issues });
  } catch (error) {
    logger.error(`Get all issues error: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ------------------------------------------------------------------------------------------
// approve issue request (admin)
const approveRequest = async (req, res) => {
  try {
    // the issue should be valid
    const issue = await IssueRequest.findById(req.params.issueId);

    if (!issue) {
      return res.status(404).json({ message: "Issue request not found" });
    }

    // the status of issue should only be "pending" as only pending requests can be approved
    if (issue.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending requests can be approved" });
    }

    // the book should be in stock
    const book = await Book.findById(issue.book);
    if (book.availableStock === 0) {
      return res.status(400).json({ message: "Book is out of stock" });
    }

    // user should not already have >= 7 approved books
    const approvedBooks = await IssueRequest.countDocuments({
      user: issue.user,
      status: "approved",
    });
    if (approvedBooks >= 7) {
      return res
        .status(400)
        .json({ message: "User already has 7 approved books" });
    }

    // update stock, update issue details, update user's issued books array
    book.availableStock -= 1;
    await book.save();

    issue.status = "approved";
    issue.issueDate = new Date();
    issue.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
    await issue.save();

    await User.findByIdAndUpdate(issue.user, {
      $push: { issuedBooks: issue._id },
    });

    return res.status(200).json({ message: "Issue request approved", issue });
  } catch (error) {
    logger.error(`Approve request error: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ------------------------------------------------------------------------------------------
// reject issue request (admin)
const rejectRequest = async (req, res) => {
  try {
    // the issue should be valid and in the "pending" state only
    const issue = await IssueRequest.findById(req.params.issueId);

    if (!issue) {
      return res.status(404).json({ message: "Issue request not found" });
    }

    if (issue.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending requests can be rejected" });
    }

    issue.status = "rejected";
    await issue.save();

    return res.status(200).json({ message: "Issue request rejected", issue });
  } catch (error) {
    logger.error(`Reject request error: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ------------------------------------------------------------------------------------------
// confirm book return (admin)

const confirmReturn = async (req, res) => {
  try {
    // the issue should be valid
    const issue = await IssueRequest.findById(req.params.issueId);

    if (!issue) {
      return res.status(404).json({ message: "Issue request not found" });
    }

    // the issue status should only be "return_requested"
    if (issue.status !== "return_requested") {
      return res
        .status(400)
        .json({ message: "No return request found for this issue" });
    }

    // update book stock, issue details, and remove this issue from user's issuedBooks array
    const book = await Book.findById(issue.book);
    book.availableStock += 1;
    await book.save();

    issue.status = "returned";
    issue.returnDate = new Date();
    await issue.save();

    await User.findByIdAndUpdate(issue.user, {
      $pull: { issuedBooks: issue._id },
    });

    return res
      .status(200)
      .json({ message: "Return confirmed successfully", issue });
  } catch (error) {
    logger.error(`Confirm return error: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ------------------------------------------------------------------------------------------
//  cancel a "pending" request (user)
const cancelRequest = async (req, res) => {
  try {
    // the issue should be valid
    const issue = await IssueRequest.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue request not found" });
    }

    // this issue should only belong to the logged in user
    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // the user can only cancel "pending" requests
    if (issue.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending requests can be cancelled" });
    }

    await issue.deleteOne();

    return res
      .status(200)
      .json({ message: "Issue request cancelled successfully" });
  } catch (error) {
    logger.error(`Cancel request error: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  requestIssue,
  getMyIssues,
  requestReturn,
  cancelRequest,
  getAllIssues,
  approveRequest,
  rejectRequest,
  confirmReturn,
};
