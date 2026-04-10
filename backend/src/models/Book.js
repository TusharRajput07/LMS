const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    totalStock: {
      type: Number,
      required: true,
      min: 0,
    },
    availableStock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

bookSchema.index({ title: "text", author: "text" });
bookSchema.index({ genre: 1 });
bookSchema.index({ availableStock: 1 });

module.exports = mongoose.model("Book", bookSchema);
