import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials, logout } from "./store/slices/authSlice";
import axiosInstance from "./api/axios";
import Home from "./components/Home";
import Auth from "./components/Auth";
import Books from "./components/Books";
import MyBooks from "./components/MyBooks";
import Dashboard from "./components/admin/Dashboard";
import BookManagement from "./components/admin/BookManagement";
import IssueRequests from "./components/admin/IssueRequests";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";

const App = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        // there is no token in the local storage. so user was never logged in. so there is no point in calling the auth/me api. so we'll set isCheckingAuth to false, and let the routes render. in this case user will be taken to the home/auth page to login again.
        setIsCheckingAuth(false);
        return;
      }

      try {
        const res = await axiosInstance.get("/auth/me");
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: token,
          }),
        );
      } catch (err) {
        dispatch(logout());
      } finally {
        setIsCheckingAuth(false);
      }
    };

    restoreSession();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0f0a1a] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              user?.role === "admin" ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <Navigate to="/books" />
              )
            ) : (
              <Home />
            )
          }
        />
        <Route
          path="/auth"
          element={
            isAuthenticated ? (
              user?.role === "admin" ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <Navigate to="/books" />
              )
            ) : (
              <Auth />
            )
          }
        />

        {/* User routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/books" element={<Books />} />
          <Route path="/my-books" element={<MyBooks />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/books" element={<BookManagement />} />
          <Route path="/admin/issues" element={<IssueRequests />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
