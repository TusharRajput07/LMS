import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../store/slices/authSlice";
import axiosInstance from "../api/axios";

const Auth = () => {
  const [isSignin, setIsSignin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    adminSecret: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    // update the values of fields from input
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignin) {
        // signin
        const res = await axiosInstance.post("/auth/signin", {
          email: formData.email,
          password: formData.password,
        });
        console.log(res);

        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: res.data.accessToken,
          }),
        );
        res.data.user.role === "admin"
          ? navigate("/admin/dashboard")
          : navigate("/books");
      } else {
        // signup
        await axiosInstance.post("/auth/signup", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminSecret: formData.adminSecret,
        });

        // Auto signin after signup
        const signinRes = await axiosInstance.post("/auth/signin", {
          email: formData.email,
          password: formData.password,
        });
        console.log(signinRes);

        dispatch(
          setCredentials({
            user: signinRes.data.user,
            accessToken: signinRes.data.accessToken,
          }),
        );
        signinRes.data.user.role === "admin"
          ? navigate("/admin/dashboard")
          : navigate("/books");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    // change the mode between signin and signup
    setIsSignin(!isSignin);
    setError("");
    setFormData({ name: "", email: "", password: "", adminSecret: "" });
    setShowAdminSecret(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0a1a] flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-pink-600 rounded-full opacity-20 blur-3xl" />

      {/* Card */}
      <div className="z-10 bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-md shadow-2xl">
        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-1">
          {isSignin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-gray-400 text-center text-sm mb-6">
          {isSignin ? "Sign in to continue" : "Sign up to get started"}
        </p>

        {/* Error */}
        {error && (
          <div className="bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isSignin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none transition"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none transition"
          />

          {!isSignin && (
            <div>
              <button
                type="button"
                onClick={() => setShowAdminSecret(!showAdminSecret)}
                className="text-purple-400 text-sm hover:text-purple-300 transition cursor-pointer"
              >
                {showAdminSecret
                  ? "− Remove Admin Secret"
                  : "+ Add Admin Secret"}
              </button>
              {showAdminSecret && (
                <input
                  type="password"
                  name="adminSecret"
                  placeholder="Admin Secret Key"
                  value={formData.adminSecret}
                  onChange={handleChange}
                  className="mt-2 w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none transition"
                />
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 rounded-xl transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
          >
            {loading ? "Please wait..." : isSignin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          {isSignin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={switchMode}
            className="text-pink-400 hover:text-pink-300 font-semibold transition cursor-pointer"
          >
            {isSignin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
