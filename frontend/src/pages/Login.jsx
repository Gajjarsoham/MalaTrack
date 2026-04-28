import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success("🙏 Jai Shri Krishna! Welcome back");
      navigate("/");
    } catch {
      toast.error("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" 
         style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(255,125,16,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(139,0,0,0.1) 0%, transparent 60%), #fdf8f0" }}>
      
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-10" 
           style={{ background: "radial-gradient(circle, #ff7d10, transparent)" }} />
      <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full opacity-10" 
           style={{ background: "radial-gradient(circle, #8b0000, transparent)" }} />
      
      {/* Mala decorative dots */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: i % 2 === 0 ? "#ff7d10" : "#ffa000",
            top: `${15 + Math.random() * 70}%`,
            left: `${5 + Math.random() * 90}%`,
            opacity: 0.2,
          }}
          animate={{ y: [0, -10, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-4"
      >
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ background: "linear-gradient(135deg, #ff7d10, #c74308)" }}
            >
              <span className="text-3xl">🪬</span>
            </motion.div>
            <h1 className="text-3xl font-bold mb-1" 
                style={{ fontFamily: "'Playfair Display', serif", color: "#c74308" }}>
              Laddu Gopal Mala
            </h1>
            <p className="text-sm" style={{ color: "#a0522d", fontFamily: "'DM Sans', sans-serif" }}>
              Business Manager — Admin Portal
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, #ff7d1060)" }} />
              <span className="text-xs" style={{ color: "#ffa000" }}>🌸 ॐ 🌸</span>
              <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, #ff7d1060)" }} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#7c3a1a" }}>
                Username
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#7c3a1a" }}>
                Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <motion.button
              type="submit"
              className="btn-primary w-full py-3 text-base mt-2"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Logging in...
                </span>
              ) : "🙏 Login to Dashboard"}
            </motion.button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: "#c49a6c" }}>
            Only authorized admin can access this portal
          </p>
        </div>
      </motion.div>
    </div>
  );
}
