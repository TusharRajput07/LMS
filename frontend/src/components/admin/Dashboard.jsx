import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = stats
    ? [
        { text: "Total Books", value: stats.totalBooks },
        { text: "Total Users", value: stats.totalUsers },
        { text: "Pending Requests", value: stats.pendingRequests },
        { text: "Approved Issues", value: stats.approvedIssues },
        { text: "Return Requested", value: stats.returnRequested },
        { text: "Overdue Books", value: stats.overdueBooks },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0f0a1a] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400 mb-8">Library overview at a glance</p>

        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {cards.map((card) => (
              <div
                key={card.text}
                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-6 flex flex-col gap-2"
              >
                <p className="text-4xl font-bold text-white">{card.value}</p>
                <p className="text-gray-400 text-sm">{card.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
