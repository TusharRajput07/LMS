import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://cdn.dribbble.com/userupload/31752550/file/original-51972ed5cd2e71e3d87017dcbc400f99.gif"
          alt="background"
          className="w-full h-full object-cover brightness-[0.65]"
        />
        <div className="absolute inset-0 bg-[#0f0a1a]/60" />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs uppercase tracking-widest text-pink-400 font-semibold">
          Library Management System
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-4">
          Your Library,{" "}
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Simplified
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/60 font-light max-w-xl mb-3">
          Browse books, request issues, and manage your reads — all in one
          place.
        </p>

        <p className="text-sm text-white/30 mb-10 tracking-wide">
          Sign in to get started. No fuss, just books.
        </p>

        <Link to="/auth">
          <button className="px-10 py-4 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 active:scale-95 transition-all duration-150 shadow-lg shadow-pink-900/30">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
