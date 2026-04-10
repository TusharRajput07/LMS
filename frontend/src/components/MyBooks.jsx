import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

const MyBooks = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [actioningId, setActioningId] = useState(null);

  const fetchMyIssues = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/issues/my");
      setIssues(res.data.issues);
    } catch (err) {
      console.error("Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const handleCancel = async (issueId) => {
    setActioningId(issueId);
    try {
      const res = await axiosInstance.delete(`/issues/cancel/${issueId}`);
      setMessage({ type: "success", text: res.data.message });
      fetchMyIssues();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setActioningId(null);
    }
  };

  const handleReturn = async (issueId) => {
    setActioningId(issueId);
    try {
      const res = await axiosInstance.post(`/issues/return/${issueId}`);
      setMessage({ type: "success", text: res.data.message });
      fetchMyIssues();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setActioningId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "approved":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "rejected":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      case "return_requested":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "returned":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "";
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0f0a1a] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">My Books</h1>
        <p className="text-gray-400 mb-8">
          Track all your issue requests and returns
        </p>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-pink-500/10 border-pink-500/30 text-pink-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : issues.length === 0 ? (
          <p className="text-gray-400 text-center">No issue requests yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {issues.map((issue) => (
              <div
                key={issue._id}
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white font-semibold text-lg">
                      {issue.book.title}
                    </h2>
                    <p className="text-gray-400 text-sm">{issue.book.author}</p>
                    <p className="text-purple-400 text-xs">
                      {issue.book.genre}
                    </p>

                    <div className="flex flex-col gap-1 mt-2 text-xs text-gray-500">
                      <p>Requested: {formatDate(issue.createdAt)}</p>
                      {issue.issueDate && (
                        <p>Issued: {formatDate(issue.issueDate)}</p>
                      )}
                      {issue.dueDate && (
                        <p className="text-yellow-500">
                          Due: {formatDate(issue.dueDate)}
                        </p>
                      )}
                      {issue.returnDate && (
                        <p>Returned: {formatDate(issue.returnDate)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    {/* Status badge */}
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusStyle(issue.status)}`}
                    >
                      {issue.status.replace("_", " ").toUpperCase()}
                    </span>

                    {/* Actions */}
                    {issue.status === "pending" && (
                      <button
                        onClick={() => handleCancel(issue._id)}
                        disabled={actioningId === issue._id}
                        className="text-xs text-pink-400 hover:text-pink-300 border border-pink-500/30 px-3 py-1 rounded-xl transition disabled:opacity-40"
                      >
                        {actioningId === issue._id
                          ? "Cancelling..."
                          : "Cancel Request"}
                      </button>
                    )}

                    {issue.status === "approved" && (
                      <button
                        onClick={() => handleReturn(issue._id)}
                        disabled={actioningId === issue._id}
                        className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 px-3 py-1 rounded-xl transition disabled:opacity-40"
                      >
                        {actioningId === issue._id
                          ? "Requesting..."
                          : "Request Return"}
                      </button>
                    )}

                    {issue.status === "return_requested" && (
                      <p className="text-xs text-gray-500">Waiting for admin</p>
                    )}
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

export default MyBooks;
