import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Users, ShoppingBag, LogOut, Menu, X, Beads
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", emoji: "📊" },
  { to: "/workers", icon: Users, label: "Workers (Karigar)", emoji: "🧵" },
  { to: "/sellers", icon: ShoppingBag, label: "Sellers (Wholesaler)", emoji: "🏪" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: "rgba(255,125,16,0.15)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: "linear-gradient(135deg, #ff7d10, #c74308)" }}>
            <span className="text-xl">🪬</span>
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight" 
                style={{ fontFamily: "'Playfair Display', serif", color: "#c74308" }}>
              Laddu Gopal Mala
            </h2>
            <p className="text-xs" style={{ color: "#a0522d" }}>Business Manager</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-2" 
           style={{ color: "rgba(139,0,0,0.4)" }}>Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="text-lg">{item.emoji}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t" style={{ borderColor: "rgba(255,125,16,0.15)" }}>
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
               style={{ background: "linear-gradient(135deg, #ff7d10, #c74308)" }}>
            {user?.username?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#2d1a0e" }}>{user?.username}</p>
            <p className="text-xs" style={{ color: "#a0522d" }}>Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left"
          style={{ color: "#dc2626" }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#fdf8f0" }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r"
             style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)", borderColor: "rgba(255,125,16,0.15)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(0,0,0,0.4)" }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col border-r lg:hidden"
              style={{ background: "rgba(253,248,240,0.98)", borderColor: "rgba(255,125,16,0.2)" }}
            >
              <button
                className="absolute top-4 right-4 p-1 rounded-lg"
                onClick={() => setMobileOpen(false)}
                style={{ color: "#c74308" }}
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b"
                style={{ background: "rgba(255,255,255,0.9)", borderColor: "rgba(255,125,16,0.15)" }}>
          <button onClick={() => setMobileOpen(true)} style={{ color: "#c74308" }}>
            <Menu size={22} />
          </button>
          <h1 className="font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "#c74308" }}>
            🪬 Laddu Gopal Mala
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto page-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
