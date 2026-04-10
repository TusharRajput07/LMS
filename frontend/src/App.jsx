import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
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

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
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
