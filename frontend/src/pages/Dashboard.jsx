import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { dashboardAPI } from "../api";
import toast from "react-hot-toast";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

function StatCard({ emoji, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card stat-card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#a0522d" }}>{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color, fontFamily: "'Playfair Display', serif" }}>{value}</p>
        </div>
        <div className="text-3xl">{emoji}</div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🪬</div>
        <p style={{ color: "#a0522d" }}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "#c74308" }}>
          🙏 Jai Shri Krishna
        </h1>
        <p className="mt-1" style={{ color: "#a0522d" }}>Welcome to your Mala Business Dashboard</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-px w-16" style={{ background: "linear-gradient(to right, #ff7d10, transparent)" }} />
          <span className="text-xs" style={{ color: "#ffa000" }}>🌸 ॐ नमो भगवते वासुदेवाय 🌸</span>
          <div className="h-px w-16" style={{ background: "linear-gradient(to left, #ff7d10, transparent)" }} />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard emoji="🧵" label="Total Workers" value={data?.total_workers || 0} color="#c74308" delay={0.05} />
        <StatCard emoji="🏪" label="Total Sellers" value={data?.total_sellers || 0} color="#c74308" delay={0.1} />
        <StatCard emoji="📿" label="Malas Made" value={Number(data?.total_malas_made || 0).toLocaleString()} color="#8b0000" delay={0.15} />
        <StatCard emoji="💰" label="Malas Sold" value={Number(data?.total_malas_sold || 0).toLocaleString()} color="#8b0000" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard emoji="⏳" label="Pending Payment (Workers)" value={fmt(data?.pending_payment)} color="#dc2626" delay={0.25} />
        <StatCard emoji="🛠️" label="Total Making Cost" value={fmt(data?.total_making_cost)} color="#7c3a1a" delay={0.3} />
        <StatCard emoji="💵" label="Total Revenue" value={fmt(data?.total_revenue)} color="#c74308" delay={0.35} />
        <StatCard emoji="📈" label="Total Profit" value={fmt(data?.total_profit)} color="#16a34a" delay={0.4} />
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="card p-6"
      >
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: "#c74308" }}>
          📋 Business Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {[
                ["Total Karigar (Workers)", data?.total_workers, "🧵"],
                ["Total Wholesalers (Sellers)", data?.total_sellers, "🏪"],
                ["Total Malas Received from Workers", data?.total_malas_made, "📿"],
                ["Total Malas Sold to Sellers", data?.total_malas_sold, "🎁"],
                ["Total Worker Payment Due (Pending)", fmt(data?.pending_payment), "⚠️"],
                ["Total Making Cost Paid to Workers", fmt(data?.total_making_cost), "💸"],
                ["Total Revenue from Sales", fmt(data?.total_revenue), "💰"],
                ["Total Net Profit", fmt(data?.total_profit), "📈"],
              ].map(([label, val, emoji]) => (
                <tr key={label} className="table-row border-b" style={{ borderColor: "rgba(255,125,16,0.08)" }}>
                  <td className="py-3 pr-4" style={{ color: "#7c3a1a" }}><span className="mr-2">{emoji}</span>{label}</td>
                  <td className="py-3 font-bold text-right" style={{ color: "#2d1a0e" }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
