const mongoose = require("mongoose");

const issueRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "return_requested", "returned"],
      default: "pending",
    },
    issueDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    returnDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

issueRequestSchema.index({ user: 1 });
issueRequestSchema.index({ status: 1 });
issueRequestSchema.index({ dueDate: 1 });

module.exports = mongoose.model("IssueRequest", issueRequestSchema);
