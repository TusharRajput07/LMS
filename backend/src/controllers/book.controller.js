const Book = require("../models/Book");

// ---------------------------------------------------------------------------------------------
// add a book (admin onli)
const addBook = async (req, res) => {
  try {
    const { title, author, genre, description, totalStock } = req.body;

    if (!title || !author || !genre || !totalStock) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingBook = await Book.findOne({ title, author });
    if (existingBook) {
      return res.status(400).json({ message: "Book already exists" });
    }

    const book = new Book({
      title,
      author,
      genre,
      description,
      totalStock,
      availableStock: totalStock,
    });

    await book.save();

    return res.status(201).json({ message: "Book added successfully", book });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------------------------
// get all books by filter (public)
const getAllBooks = async (req, res) => {
  try {
    const { genre, author, availability, search } = req.query;

    let filter = {};

    if (genre) filter.genre = { $regex: genre, $options: "i" };
    if (author) filter.author = { $regex: author, $options: "i" };
    if (availability === "available") {
      filter.availableStock = { $gt: 0 };
    } else if (availability === "unavailable") {
      filter.availableStock = 0;
    }
    if (search) filter.title = { $regex: search, $options: "i" };

    const books = await Book.find(filter);

    return res.status(200).json({ total: books.length, books });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------------------------
// get book by id (public)

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
    }

    return res.status(200).json({ book });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------------------------
// update a book (admin onli)

const updateBook = async (req, res) => {
  try {
    const { title, author, genre, description, totalStock } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // stock update logic
    if (totalStock !== undefined) {
      const diff = totalStock - book.totalStock;
      book.availableStock = Math.max(0, book.availableStock + diff);
      book.totalStock = totalStock;
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (genre) book.genre = genre;
    if (description) book.description = description;

    await book.save();

    return res.status(200).json({ message: "Book updated successfully", book });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------------------------
// delete a book (admin onli)

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await book.deleteOne();

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------------------------
// get genres (user)
const getGenres = async (req, res) => {
  try {
    const genres = await Book.distinct("genre");
    return res.status(200).json({ genres });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getGenres,
};
