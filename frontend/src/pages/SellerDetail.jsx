import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { sellersAPI, workersAPI } from "../api";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Trash2, Pencil } from "lucide-react";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

function SaleModal({ sellerId, existing, patterns, onClose, onSave }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState(existing ? {
    date: existing.date,
    malas_sold: existing.malas_sold,
    pattern_name: existing.pattern_name,
    sell_price_per_piece: existing.sell_price_per_piece,
    making_cost_per_piece: existing.making_cost_per_piece,
    payment_received: existing.payment_received,
  } : {
    date: today, malas_sold: "", pattern_name: "", sell_price_per_piece: "", making_cost_per_piece: "", payment_received: ""
  });
  const [loading, setLoading] = useState(false);

  const totalSale = (Number(form.malas_sold) || 0) * (Number(form.sell_price_per_piece) || 0);
  const totalCost = (Number(form.malas_sold) || 0) * (Number(form.making_cost_per_piece) || 0);
  const profit = totalSale - totalCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        malas_sold: Number(form.malas_sold),
        sell_price_per_piece: Number(form.sell_price_per_piece),
        making_cost_per_piece: Number(form.making_cost_per_piece),
        payment_received: Number(form.payment_received),
        seller_id: Number(sellerId),
      };
      let res;
      if (existing) {
        res = await sellersAPI.updateSale(existing.id, payload);
      } else {
        res = await sellersAPI.addSale(sellerId, payload);
      }
      onSave(res.data, !!existing);
      toast.success(existing ? "✅ Sale updated!" : "✅ Sale record added!");
      onClose();
    } catch {
      toast.error("Failed to save sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="card w-full max-w-lg p-6 my-8">
        <h3 className="text-xl font-bold mb-5" style={{ fontFamily: "'Playfair Display', serif", color: "#c74308" }}>
          {existing ? "✏️ Edit Sale Record" : "➕ Add Sale Record"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#7c3a1a" }}>Date *</label>
              <input type="date" className="input-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#7c3a1a" }}>Malas Sold *</label>
              <input type="number" className="input-field" placeholder="e.g. 1000" value={form.malas_sold} onChange={e => setForm(p => ({ ...p, malas_sold: e.target.value }))} required min="1" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#7c3a1a" }}>Pattern Name *</label>
            <input className="input-field" list="pattern-suggestions" placeholder="e.g. Red Tulsi Pattern"
              value={form.pattern_name} onChange={e => setForm(p => ({ ...p, pattern_name: e.target.value }))} required />
            <datalist id="pattern-suggestions">
              {patterns.map(p => <option key={p} value={p} />)}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#7c3a1a" }}>Sell Price/Mala (₹) *</label>
              <input type="number" step="0.01" className="input-field" placeholder="e.g. 12.00"
                value={form.sell_price_per_piece} onChange={e => setForm(p => ({ ...p, sell_price_per_piece: e.target.value }))} required min="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#7c3a1a" }}>Making Cost/Mala (₹) *</label>
              <input type="number" step="0.01" className="input-field" placeholder="e.g. 5.50"
                value={form.making_cost_per_piece} onChange={e => setForm(p => ({ ...p, making_cost_per_piece: e.target.value }))} required min="0" />
              <p className="text-xs mt-1" style={{ color: "#a0522d" }}>How much you paid worker per mala</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#7c3a1a" }}>Payment Received (₹) *</label>
            <input type="number" step="0.01" className="input-field" placeholder="Amount received from seller"
              value={form.payment_received} onChange={e => setForm(p => ({ ...p, payment_received: e.target.value }))} required min="0" />
          </div>

          {/* Calculation preview */}
          {form.malas_sold && form.sell_price_per_piece && (
            <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,125,16,0.06)", border: "1px solid rgba(255,125,16,0.2)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#a0522d" }}>📊 Calculation Preview</p>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#7c3a1a" }}>Total Sale Value</span>
                <span className="font-semibold" style={{ color: "#2d1a0e" }}>{fmt(totalSale)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#7c3a1a" }}>Total Making Cost</span>
                <span className="font-semibold" style={{ color: "#2d1a0e" }}>{fmt(totalCost)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-2" style={{ borderColor: "rgba(255,125,16,0.2)" }}>
                <span style={{ color: profit >= 0 ? "#16a34a" : "#dc2626" }}>📈 Profit</span>
                <span style={{ color: profit >= 0 ? "#16a34a" : "#dc2626" }}>{fmt(profit)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? "Saving..." : (existing ? "Update" : "Add Sale")}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function SellerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [sales, setSales] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSale, setEditSale] = useState(null);

  useEffect(() => {
    Promise.all([sellersAPI.list(), sellersAPI.getSales(id), workersAPI.list()])
      .then(async ([sRes, saRes, wRes]) => {
        const s = sRes.data.find(s => s.id === Number(id));
        setSeller(s);
        setSales(saRes.data);
        // Get all patterns from all worker receipts for suggestions
        const receiptsPromises = wRes.data.map(w => workersAPI.getReceipts(w.id));
        const receiptsAll = await Promise.all(receiptsPromises);
        const allPatterns = [...new Set(receiptsAll.flatMap(r => r.data.map(rec => rec.pattern_name)))];
        setPatterns(allPatterns);
      })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = (record, isEdit) => {
    if (isEdit) {
      setSales(prev => prev.map(s => s.id === record.id ? record : s));
    } else {
      setSales(prev => [record, ...prev]);
    }
  };

  const handleDelete = async (saleId) => {
    if (!window.confirm("Delete this sale record?")) return;
    try {
      await sellersAPI.deleteSale(saleId);
      setSales(prev => prev.filter(s => s.id !== saleId));
      toast.success("Sale record deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalMalas = sales.reduce((s, r) => s + r.malas_sold, 0);
  const totalRevenue = sales.reduce((s, r) => s + Number(r.sell_price_per_piece) * r.malas_sold, 0);
  const totalReceived = sales.reduce((s, r) => s + Number(r.payment_received), 0);
  const totalProfit = sales.reduce((s, r) => s + Number(r.profit), 0);
  const totalCost = sales.reduce((s, r) => s + Number(r.making_cost_per_piece) * r.malas_sold, 0);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-5xl animate-bounce">🪬</div></div>;
  if (!seller) return <div className="p-6 text-center" style={{ color: "#c74308" }}>Seller not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 mb-6 text-sm font-medium" style={{ color: "#c74308" }}
        onClick={() => navigate("/sellers")} whileHover={{ x: -3 }}>
        <ArrowLeft size={16} /> Back to Sellers
      </motion.button>

      {/* Seller Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                 style={{ background: "linear-gradient(135deg, #8b0000, #c74308)" }}>
              {seller.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "#c74308" }}>
                {seller.name}
              </h1>
              <p className="text-sm" style={{ color: "#a0522d" }}>📍 {seller.city} {seller.phone && `• 📞 ${seller.phone}`}</p>
            </div>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={() => { setEditSale(null); setShowModal(true); }}>
            <Plus size={16} /> Add Sale Record
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-5 border-t" style={{ borderColor: "rgba(255,125,16,0.15)" }}>
          {[
            ["🎁 Malas Sold", totalMalas.toLocaleString(), "#2d1a0e"],
            ["💵 Sale Value", fmt(totalRevenue), "#c74308"],
            ["✅ Received", fmt(totalReceived), "#c74308"],
            ["🛠️ Making Cost", fmt(totalCost), "#7c3a1a"],
            ["📈 Profit", fmt(totalProfit), "#16a34a"],
          ].map(([label, val, color]) => (
            <div key={label} className="text-center">
              <p className="text-xs mb-1" style={{ color: "#a0522d" }}>{label}</p>
              <p className="font-bold text-sm sm:text-base" style={{ color, fontFamily: "'Playfair Display', serif" }}>{val}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sales Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card overflow-hidden">
        <div className="table-header px-5 py-3">
          <h2 className="font-bold">📋 Sale Records ({sales.length})</h2>
        </div>
        {sales.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏪</div>
            <p style={{ color: "#a0522d" }}>No sale records yet. Add the first sale!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "rgba(255,125,16,0.1)", background: "rgba(255,125,16,0.04)" }}>
                  {["Date", "Pattern", "Malas", "Sell/pc", "Make/pc", "Received", "Profit", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#7c3a1a" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {sales.map((s, i) => (
                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }} className="table-row border-b" style={{ borderColor: "rgba(255,125,16,0.06)" }}>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "#2d1a0e" }}>{s.date}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(139,0,0,0.1)", color: "#8b0000" }}>
                          {s.pattern_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#2d1a0e" }}>{s.malas_sold}</td>
                      <td className="px-4 py-3" style={{ color: "#2d1a0e" }}>₹{s.sell_price_per_piece}</td>
                      <td className="px-4 py-3" style={{ color: "#7c3a1a" }}>₹{s.making_cost_per_piece}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#c74308" }}>{fmt(s.payment_received)}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: Number(s.profit) >= 0 ? "#16a34a" : "#dc2626" }}>
                        {fmt(s.profit)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditSale(s); setShowModal(true); }}
                            className="p-1.5 rounded-lg" style={{ color: "#ff7d10" }} title="Edit">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(s.id)}
                            className="p-1.5 rounded-lg" style={{ color: "#dc2626" }} title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <SaleModal
            sellerId={id}
            existing={editSale}
            patterns={patterns}
            onClose={() => { setShowModal(false); setEditSale(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
