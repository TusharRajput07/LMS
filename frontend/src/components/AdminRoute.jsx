import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (user?.role !== "admin") return <Navigate to="/books" />;

  return <Outlet />;
};

export default AdminRoute;
