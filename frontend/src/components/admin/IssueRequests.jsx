import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";

const tabs = [
  "all",
  "pending",
  "approved",
  "return_requested",
  "rejected",
  "returned",
];

const IssueRequests = () => {
  const [issues, setIssues] = useState([]); // array of all issue requests
  const [loading, setLoading] = useState(true); // loading for issue requests
  const [activeTab, setActiveTab] = useState("all"); // currently selected filter
  const [actioningId, setActioningId] = useState(null); // id for the particular issue in action
  const [message, setMessage] = useState({ type: "", text: "" }); // success/error message for the issues

  const fetchIssues = async (status) => {
    setLoading(true);
    try {
      const params = status === "all" ? {} : { status };
      const res = await axiosInstance.get("/issues", { params });
      setIssues(res.data.issues);
    } catch (err) {
      console.error("Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues(activeTab);
  }, [activeTab]);

  const handleApprove = async (issueId) => {
    setActioningId(issueId);
    setMessage({ type: "", text: "" });
    try {
      const res = await axiosInstance.patch(`/issues/approve/${issueId}`);
      setMessage({ type: "success", text: res.data.message });
      fetchIssues(activeTab);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (issueId) => {
    setActioningId(issueId);
    setMessage({ type: "", text: "" });
    try {
      const res = await axiosInstance.patch(`/issues/reject/${issueId}`);
      setMessage({ type: "success", text: res.data.message });
      fetchIssues(activeTab);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setActioningId(null);
    }
  };

  const handleConfirmReturn = async (issueId) => {
    setActioningId(issueId);
    setMessage({ type: "", text: "" });
    try {
      const res = await axiosInstance.patch(
        `/issues/confirm-return/${issueId}`,
      );
      setMessage({ type: "success", text: res.data.message });
      fetchIssues(activeTab);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setActioningId(null);
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
        <h1 className="text-3xl font-bold text-white mb-2">Issue Requests</h1>
        <p className="text-gray-400 mb-8">
          Manage all book issue and return requests
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-4 py-2 rounded-xl border transition cursor-pointer ${
                activeTab === tab
                  ? "bg-white/10 border-white/20 text-white font-semibold"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {tab.replace("_", " ").toUpperCase()}
            </button>
          ))}
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

        {/* Issues List */}
        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : issues.length === 0 ? (
          <p className="text-gray-400 text-center">No requests found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {issues.map((issue) => (
              <div
                key={issue._id}
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left box */}
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white font-semibold text-lg">
                      {issue.book?.title || "Deleted Book"}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Requested by: {issue.user?.name || "Deleted User"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {issue.user?.email || "—"}
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

                  {/* Right side — status + actions */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-white/5 border-white/10 text-gray-400">
                      {issue.status.replace("_", " ").toUpperCase()}
                    </span>

                    {issue.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(issue._id)}
                          disabled={actioningId === issue._id}
                          className="text-xs text-green-400 hover:text-green-300 border border-green-500/30 px-3 py-1 rounded-xl transition cursor-pointer disabled:opacity-40"
                        >
                          {actioningId === issue._id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(issue._id)}
                          disabled={actioningId === issue._id}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1 rounded-xl transition cursor-pointer disabled:opacity-40"
                        >
                          {actioningId === issue._id ? "..." : "Reject"}
                        </button>
                      </div>
                    )}

                    {issue.status === "return_requested" && (
                      <button
                        onClick={() => handleConfirmReturn(issue._id)}
                        disabled={actioningId === issue._id}
                        className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 px-3 py-1 rounded-xl transition cursor-pointer disabled:opacity-40"
                      >
                        {actioningId === issue._id
                          ? "Confirming..."
                          : "Confirm Return"}
                      </button>
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

export default IssueRequests;
