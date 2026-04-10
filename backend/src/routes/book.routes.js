const express = require("express");
const router = express.Router();
const {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getGenres,
} = require("../controllers/book.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

router.post("/", verifyToken, verifyAdmin, addBook); // admin only
router.get("/", getAllBooks); // public
router.get("/genres", getGenres); // public
router.get("/:id", getBookById); // public
router.put("/:id", verifyToken, verifyAdmin, updateBook); // admin
router.delete("/:id", verifyToken, verifyAdmin, deleteBook); // admin

module.exports = router;
