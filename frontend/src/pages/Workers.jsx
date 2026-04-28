import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { workersAPI } from "../api";
import toast from "react-hot-toast";
import { Plus, Trash2, ChevronRight, MapPin, Phone } from "lucide-react";

function AddWorkerModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", city: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await workersAPI.create(form);
      onAdd(res.data);
      toast.success("✅ Worker added!");
      onClose();
    } catch {
      toast.error("Failed to add worker");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="card w-full max-w-md p-6"
      >
        <h3 className="text-xl font-bold mb-5" style={{ fontFamily: "'Playfair Display', serif", color: "#c74308" }}>
          ➕ Add New Worker (Karigar)
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#7c3a1a" }}>Worker Name *</label>
            <input className="input-field" placeholder="e.g. Sunita Devi" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#7c3a1a" }}>City *</label>
            <input className="input-field" placeholder="e.g. Ahmedabad" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#7c3a1a" }}>Phone Number</label>
            <input className="input-field" placeholder="e.g. 9876543210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? "Adding..." : "Add Worker"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    workersAPI.list()
      .then((r) => setWorkers(r.data))
      .catch(() => toast.error("Failed to load workers"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this worker and all their records?")) return;
    try {
      await workersAPI.delete(id);
      setWorkers(prev => prev.filter(w => w.id !== id));
      toast.success("Worker deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = workers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "#c74308" }}>
            🧵 Workers (Karigar)
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#a0522d" }}>
            {workers.length} workers registered
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary flex items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          <Plus size={18} />
          Add Worker
        </motion.button>
      </motion.div>

      <div className="mb-4">
        <input
          className="input-field max-w-sm"
          placeholder="🔍 Search by name or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="text-4xl animate-bounce mb-3">🪬</div>
          <p style={{ color: "#a0522d" }}>Loading workers...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 card">
          <div className="text-5xl mb-3">🧵</div>
          <p className="text-lg font-semibold" style={{ color: "#c74308" }}>No workers found</p>
          <p className="text-sm mt-1" style={{ color: "#a0522d" }}>Add your first worker to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((worker, i) => (
              <motion.div
                key={worker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                className="card p-5 cursor-pointer relative group"
                onClick={() => navigate(`/workers/${worker.id}`)}
              >
                {/* Delete btn */}
                <button
                  onClick={(e) => handleDelete(e, worker.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626" }}
                >
                  <Trash2 size={14} />
                </button>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                       style={{ background: "linear-gradient(135deg, #ff7d10, #c74308)" }}>
                    {worker.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base leading-tight truncate" style={{ color: "#2d1a0e" }}>
                      {worker.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={12} style={{ color: "#a0522d" }} />
                      <span className="text-xs" style={{ color: "#a0522d" }}>{worker.city}</span>
                    </div>
                    {worker.phone && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone size={12} style={{ color: "#a0522d" }} />
                        <span className="text-xs" style={{ color: "#a0522d" }}>{worker.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-3 space-y-1.5" style={{ borderColor: "rgba(255,125,16,0.1)" }}>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "#7c3a1a" }}>Total Malas</span>
                    <span className="font-semibold" style={{ color: "#2d1a0e" }}>{Number(worker.total_malas).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "#7c3a1a" }}>Total Earned</span>
                    <span className="font-semibold" style={{ color: "#2d1a0e" }}>₹{Number(worker.total_earned).toLocaleString()}</span>
                  </div>
                  {Number(worker.pending_amount) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "#dc2626" }}>⚠️ Pending</span>
                      <span className="font-bold" style={{ color: "#dc2626" }}>₹{Number(worker.pending_amount).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end mt-3 gap-1" style={{ color: "#ff7d10" }}>
                  <span className="text-xs font-medium">View Details</span>
                  <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showAdd && <AddWorkerModal onClose={() => setShowAdd(false)} onAdd={(w) => setWorkers(p => [w, ...p])} />}
      </AnimatePresence>
    </div>
  );
}
