import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import axiosInstance from "../api/axios";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      dispatch(logout());
      navigate("/auth");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#080510] border-b border-white/10 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <h1 className="text-white font-bold">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
          <span className="hidden md:inline text-xl">
            Library Management System
          </span>
          <span className="inline md:hidden text-lg">LMS</span>
        </span>
      </h1>

      {/* buttons */}
      <div className="flex items-center gap-6">
        {user?.role === "user" && (
          <>
            <button
              onClick={() => navigate("/books")}
              className={`text-sm font-medium transition cursor-pointer ${
                isActive("/books")
                  ? "text-pink-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Books
            </button>
            <button
              onClick={() => navigate("/my-books")}
              className={`text-sm font-medium transition cursor-pointer ${
                isActive("/my-books")
                  ? "text-pink-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              My Books
            </button>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className={`text-sm font-medium transition cursor-pointer ${
                isActive("/admin/dashboard")
                  ? "text-pink-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/admin/books")}
              className={`text-sm font-medium transition cursor-pointer ${
                isActive("/admin/books")
                  ? "text-pink-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Books
            </button>
            <button
              onClick={() => navigate("/admin/issues")}
              className={`text-sm font-medium transition cursor-pointer ${
                isActive("/admin/issues")
                  ? "text-pink-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Requests
            </button>
          </>
        )}

        {/* User info + Logout */}
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
          <p className="text-gray-400 text-sm hidden sm:block">{user?.name}</p>
          <button
            onClick={handleLogout}
            className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
