import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [filters, setFilters] = useState({
    search: "",
    genre: "",
    availability: "",
  });

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axiosInstance.get("/books/genres");
        setGenres(res.data.genres);
      } catch (err) {
        console.error("Failed to fetch genres");
      }
    };
    fetchGenres();
  }, []);

  // Fetch books whenever filters change
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/books", { params: filters });
        setBooks(res.data.books);
      } catch (err) {
        console.error("Failed to fetch books");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [filters]);

  const handleRequest = async (bookId) => {
    setRequestingId(bookId);
    setMessage({ type: "", text: "" });
    try {
      const res = await axiosInstance.post(`/issues/request/${bookId}`);
      setMessage({ type: "success", text: res.data.message });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0a1a] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Books</h1>
        <p className="text-gray-400 mb-8">
          Find and request books from our collection
        </p>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by title..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none transition"
          />
          <div className="flex gap-4">
            <select
              value={filters.genre}
              onChange={(e) =>
                setFilters({ ...filters, genre: e.target.value })
              }
              className="flex-1 bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-3 focus:outline-none transition"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>

            <select
              value={filters.availability}
              onChange={(e) =>
                setFilters({ ...filters, availability: e.target.value })
              }
              className="flex-1 bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-3 focus:outline-none transition"
            >
              <option value="">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        {/* Message */}
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
        {loading ? (
          <p className="text-gray-400 text-center">Loading books...</p>
        ) : books.length === 0 ? (
          <p className="text-gray-400 text-center">No books found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {books.map((book) => (
              <div
                key={book._id}
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-white font-semibold text-lg">
                      {book.title}
                    </h2>
                    <p className="text-gray-400 text-sm">{book.author}</p>
                    <p className="text-purple-400 text-xs mt-1">{book.genre}</p>
                    {book.description && (
                      <p className="text-gray-500 text-sm mt-2">
                        {book.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-semibold mb-3 ${
                        book.availableStock > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {book.availableStock > 0
                        ? `${book.availableStock} available`
                        : "Out of stock"}
                    </p>
                    <button
                      onClick={() => handleRequest(book._id)}
                      disabled={
                        book.availableStock === 0 || requestingId === book._id
                      }
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {requestingId === book._id ? "Requesting..." : "Request"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;
