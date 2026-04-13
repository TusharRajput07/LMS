import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";

const emptyForm = {
  title: "",
  author: "",
  genre: "",
  description: "",
  totalStock: "",
};

const BookManagement = () => {
  const [books, setBooks] = useState([]); // array of all books
  const [loading, setLoading] = useState(true); // loading for books list until they load
  const [addForm, setAddForm] = useState(emptyForm); // form content of add book form at the top
  const [addLoading, setAddLoading] = useState(false); // loading for add form until a books adds
  const [addMessage, setAddMessage] = useState({ type: "", text: "" }); // message to show after book has been added
  const [editingId, setEditingId] = useState(null); // id of the book that is currently in editing
  const [editForm, setEditForm] = useState(emptyForm); // form content of the book on which edit button is clicked
  const [editLoading, setEditLoading] = useState(false); // loading for the book currently in edit
  const [deleteLoading, setDeleteLoading] = useState(false); // loading for deleting a book
  const [message, setMessage] = useState({ type: "", text: "" }); // common message for success/error for editing and deleting a book

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/books");
      setBooks(res.data.books);
    } catch (err) {
      console.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Add book
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddMessage({ type: "", text: "" });
    try {
      const res = await axiosInstance.post("/books", {
        ...addForm,
        totalStock: Number(addForm.totalStock),
      });
      setAddMessage({ type: "success", text: res.data.message });
      setAddForm(emptyForm);
      fetchBooks();
    } catch (err) {
      setAddMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setAddLoading(false);
    }
  };

  // Edit book
  const handleEditClick = (book) => {
    setEditingId(book._id);
    setEditForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description || "",
      totalStock: book.totalStock,
    });
    setMessage({ type: "", text: "" });
  };

  // save the edited book
  const handleEditSave = async (bookId) => {
    setEditLoading(true);
    try {
      const res = await axiosInstance.put(`/books/${bookId}`, {
        ...editForm,
        totalStock: Number(editForm.totalStock),
      });
      setEditingId(null);
      setMessage({ type: "success", text: res.data.message });
      fetchBooks();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
      setEditingId(null);
    } finally {
      setEditLoading(false);
    }
  };

  // Delete book
  const handleDelete = async (bookId) => {
    setDeleteLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await axiosInstance.delete(`/books/${bookId}`);
      setMessage({ type: "success", text: res.data.message });
      fetchBooks();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const inputClass =
    "bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none transition w-full";

  return (
    <div className="min-h-screen bg-[#0f0a1a] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Book Management</h1>
        <p className="text-gray-400 mb-8">
          Add, edit, or remove books from the library
        </p>

        {/* Add Book Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-6 mb-10">
          <h2 className="text-white font-semibold text-lg mb-4">
            Add New Book
          </h2>

          {addMessage.text && (
            <div
              className={`mb-4 px-4 py-3 rounded-xl text-sm border flex items-center justify-between ${
                addMessage.type === "success"
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              <span>{addMessage.text}</span>
              <button
                onClick={() => setAddMessage({ type: "", text: "" })}
                className="ml-4 cursor-pointer opacity-70 hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Title"
              value={addForm.title}
              onChange={(e) =>
                setAddForm({ ...addForm, title: e.target.value })
              }
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Author"
              value={addForm.author}
              onChange={(e) =>
                setAddForm({ ...addForm, author: e.target.value })
              }
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Genre"
              value={addForm.genre}
              onChange={(e) =>
                setAddForm({ ...addForm, genre: e.target.value })
              }
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={addForm.description}
              onChange={(e) =>
                setAddForm({ ...addForm, description: e.target.value })
              }
              className={inputClass}
            />
            <input
              type="number"
              placeholder="Total Stock"
              value={addForm.totalStock}
              onChange={(e) =>
                setAddForm({ ...addForm, totalStock: e.target.value })
              }
              required
              min="1"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={addLoading}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 rounded-xl transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {addLoading ? "Adding..." : "Add Book"}
            </button>
          </form>
        </div>

        {/* Shared message for edit/delete */}
        {message.text && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl text-sm border flex items-center justify-between ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage({ type: "", text: "" })}
              className="ml-4 cursor-pointer opacity-70 hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        )}

        {/* Books List */}
        <h2 className="text-white font-semibold text-lg mb-4">All Books</h2>
        {loading ? (
          <p className="text-gray-400 text-center">Loading books...</p>
        ) : books.length === 0 ? (
          <p className="text-gray-400 text-center">No books added yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {books.map((book) => (
              <div
                key={book._id}
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5"
              >
                {editingId === book._id ? (
                  /* Edit form */
                  <div className="flex flex-col gap-4">
                    <h3 className="text-white font-semibold">Editing Book</h3>
                    <input
                      type="text"
                      placeholder="Title"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Author"
                      value={editForm.author}
                      onChange={(e) =>
                        setEditForm({ ...editForm, author: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Genre"
                      value={editForm.genre}
                      onChange={(e) =>
                        setEditForm({ ...editForm, genre: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                    <input
                      type="number"
                      placeholder="Total Stock"
                      value={editForm.totalStock}
                      onChange={(e) =>
                        setEditForm({ ...editForm, totalStock: e.target.value })
                      }
                      min="1"
                      className={inputClass}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditSave(book._id)}
                        disabled={editLoading}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold px-5 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
                      >
                        {editLoading ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-sm text-gray-400 hover:text-white border border-white/10 px-5 py-2 rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Book card */
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-white font-semibold text-lg">
                        {book.title}
                      </h2>
                      <p className="text-gray-400 text-sm">{book.author}</p>
                      <p className="text-purple-400 text-xs">{book.genre}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <p className="text-gray-400 text-sm">
                        Stock: {book.availableStock}/{book.totalStock}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(book)}
                          className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 px-3 py-1 rounded-xl transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(book._id)}
                          disabled={deleteLoading}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1 rounded-xl transition cursor-pointer disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookManagement;
