import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { workersAPI } from "../api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  CheckCircle,
  Clock,
} from "lucide-react";

const fmt = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

function ReceiptModal({ workerId, existing, onClose, onSave }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState(
    existing
      ? {
          date: existing.date,
          quantity: existing.quantity,
          pattern_name: existing.pattern_name,
          price_per_piece: existing.price_per_piece,
          payment_status: existing.payment_status,
          product_name: existing.product_name || "",
          unit_type: existing.unit_type || "single",
        }
      : {
          date: today,
          quantity: "",
          pattern_name: "",
          price_per_piece: "",
          payment_status: "pending",
          product_name: "",
          unit_type: "single",
        },
  );
  const [loading, setLoading] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  const total =
    (Number(form.quantity) || 0) * (Number(form.price_per_piece) || 0);

  useEffect(() => {
    if (existing) {
      const known = ["Mala", "Pankha", "Mukut"];
      if (!known.includes(existing.product_name)) {
        setIsCustom(true);
      }
    }
  }, [existing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (existing) {
        res = await workersAPI.updateReceipt(existing.id, {
          ...form,
          quantity: Number(form.quantity),
          price_per_piece: Number(form.price_per_piece),
        });
      } else {
        res = await workersAPI.addReceipt(workerId, {
          ...form,
          quantity: Number(form.quantity),
          price_per_piece: Number(form.price_per_piece),
        });
      }
      onSave(res.data, !!existing);
      toast.success(existing ? "✅ Record updated!" : "✅ Mala record added!");
      onClose();
    } catch {
      toast.error("Failed to save record");
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
        exit={{ scale: 0.9 }}
        className="card w-full max-w-md p-6"
      >
        <h3
          className="text-xl font-bold mb-5"
          style={{ fontFamily: "'Playfair Display', serif", color: "#c74308" }}
        >
          {existing ? "✏️ Edit Mala Record" : "➕ Add Mala Receipt"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-sm font-semibold mb-1.5"
                style={{ color: "#7c3a1a" }}
              >
                Date *
              </label>
              <input
                type="date"
                className="input-field"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Unit Type *
              </label>

              <select
                className="input-field"
                value={form.unit_type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, unit_type: e.target.value }))
                }
              >
                <option value="single">Single</option>
                <option value="pair">Pair</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Product *
            </label>

            <select
              className="input-field"
              value={isCustom ? "custom" : form.product_name}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "custom") {
                  setIsCustom(true);
                  setForm((p) => ({
                    ...p,
                    product_name: "",
                    unit_type: "single", // default
                  }));
                } else {
                  setIsCustom(false);

                  // 🔥 THIS IS WHERE YOUR LOGIC GOES
                  setForm((p) => ({
                    ...p,
                    product_name: value,
                    unit_type: value === "Pankha" ? "pair" : "single",
                  }));
                }
              }}
            >
              <option value="">Select Product</option>
              <option value="Mala">Mala</option>
              <option value="Pankha">Pankha</option>
              <option value="Mukut">Mukut</option>
              <option value="custom">➕ Custom</option>
            </select>
          </div>
          {isCustom && (
            <input
              className="input-field mt-2"
              placeholder="Enter custom product name"
              value={form.product_name}
              onChange={(e) =>
                setForm((p) => ({ ...p, product_name: e.target.value }))
              }
              required
            />
          )}
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "#7c3a1a" }}
            >
              Quantity *
            </label>

            <input
              type="number"
              className="input-field"
              placeholder="e.g. 150"
              value={form.quantity}
              onChange={(e) =>
                setForm((p) => ({ ...p, quantity: e.target.value }))
              }
              required
              min="1"
            />
          </div>
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "#7c3a1a" }}
            >
              Pattern Name *
            </label>
            <input
              className="input-field"
              placeholder="e.g. Red Tulsi, Yellow Flower, Peacock..."
              value={form.pattern_name}
              onChange={(e) =>
                setForm((p) => ({ ...p, pattern_name: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "#7c3a1a" }}
            >
              Price per Mala (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              placeholder="e.g. 5.50"
              value={form.price_per_piece}
              onChange={(e) =>
                setForm((p) => ({ ...p, price_per_piece: e.target.value }))
              }
              required
              min="0"
            />
          </div>
          {/* Auto calculated total */}
          {total > 0 && (
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: "rgba(255,125,16,0.08)",
                border: "1px solid rgba(255,125,16,0.2)",
              }}
            >
              <p className="text-xs" style={{ color: "#a0522d" }}>
                Total Amount
              </p>
              <p
                className="text-xl font-bold"
                style={{
                  color: "#c74308",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {fmt(total)}
              </p>
            </div>
          )}
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "#7c3a1a" }}
            >
              Payment Status *
            </label>
            <select
              className="input-field"
              value={form.payment_status}
              onChange={(e) =>
                setForm((p) => ({ ...p, payment_status: e.target.value }))
              }
            >
              <option value="pending">⏳ Pending</option>
              <option value="paid">✅ Paid</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? "Saving..." : existing ? "Update" : "Add Record"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function WorkerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editReceipt, setEditReceipt] = useState(null);

  useEffect(() => {
    Promise.all([workersAPI.list(), workersAPI.getReceipts(id)])
      .then(([wRes, rRes]) => {
        const w = wRes.data.find((w) => w.id === Number(id));
        setWorker(w);
        setReceipts(rRes.data);
      })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = (record, isEdit) => {
    if (isEdit) {
      setReceipts((prev) => prev.map((r) => (r.id === record.id ? record : r)));
    } else {
      setReceipts((prev) => [record, ...prev]);
    }
  };

  const handleDelete = async (receiptId) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await workersAPI.deleteReceipt(receiptId);
      setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
      toast.success("Record deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleMarkPaid = async (receipt) => {
    try {
      const res = await workersAPI.updateReceipt(receipt.id, {
        payment_status: "paid",
      });
      setReceipts((prev) =>
        prev.map((r) => (r.id === receipt.id ? res.data : r)),
      );
      toast.success("✅ Marked as Paid!");
    } catch {
      toast.error("Failed to update");
    }
  };

  const totalMalas = receipts.reduce((s, r) => s + r.quantity, 0);
  const totalAmount = receipts.reduce((s, r) => s + Number(r.total_price), 0);
  const pendingAmount = receipts
    .filter((r) => r.payment_status === "pending")
    .reduce((s, r) => s + Number(r.total_price), 0);
  const paidAmount = totalAmount - pendingAmount;

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-5xl animate-bounce">🪬</div>
      </div>
    );
  if (!worker)
    return (
      <div className="p-6 text-center" style={{ color: "#c74308" }}>
        Worker not found
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 mb-6 text-sm font-medium"
        style={{ color: "#c74308" }}
        onClick={() => navigate("/workers")}
        whileHover={{ x: -3 }}
      >
        <ArrowLeft size={16} /> Back to Workers
      </motion.button>

      {/* Worker Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #ff7d10, #c74308)",
              }}
            >
              {worker.name.charAt(0)}
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#c74308",
                }}
              >
                {worker.name}
              </h1>
              <p className="text-sm" style={{ color: "#a0522d" }}>
                📍 {worker.city} {worker.phone && `• 📞 ${worker.phone}`}
              </p>
            </div>
          </div>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={() => {
              setEditReceipt(null);
              setShowModal(true);
            }}
          >
            <Plus size={16} /> Add Mala Record
          </button>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t"
          style={{ borderColor: "rgba(255,125,16,0.15)" }}
        >
          {[
            ["📿 Total Malas", totalMalas.toLocaleString(), "#2d1a0e"],
            ["💰 Total Amount", fmt(totalAmount), "#c74308"],
            ["✅ Paid", fmt(paidAmount), "#16a34a"],
            ["⏳ Pending", fmt(pendingAmount), "#dc2626"],
          ].map(([label, val, color]) => (
            <div key={label} className="text-center">
              <p className="text-xs mb-1" style={{ color: "#a0522d" }}>
                {label}
              </p>
              <p
                className="font-bold text-lg"
                style={{ color, fontFamily: "'Playfair Display', serif" }}
              >
                {val}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Receipts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card overflow-hidden"
      >
        <div className="table-header px-5 py-3">
          <h2 className="font-bold">
            📋 Mala Receipt Records ({receipts.length})
          </h2>
        </div>
        {receipts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📿</div>
            <p style={{ color: "#a0522d" }}>
              No records yet. Add the first mala receipt!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    borderColor: "rgba(255,125,16,0.1)",
                    background: "rgba(255,125,16,0.04)",
                  }}
                >
                  {[
                    "Date",
                    "Pattern",
                    "Malas",
                    "Price/pc",
                    "Total",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#7c3a1a" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {receipts.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="table-row border-b"
                      style={{ borderColor: "rgba(255,125,16,0.06)" }}
                    >
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{ color: "#2d1a0e" }}
                      >
                        {r.date}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 rounded-lg text-xs font-medium"
                          style={{
                            background: "rgba(255,125,16,0.12)",
                            color: "#c74308",
                          }}
                        >
                          {r.product_name} - {r.pattern_name}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 font-semibold"
                        style={{ color: "#2d1a0e" }}
                      >
                        {r.quantity}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#2d1a0e" }}>
                        ₹{r.price_per_piece}
                      </td>
                      <td
                        className="px-4 py-3 font-bold"
                        style={{ color: "#c74308" }}
                      >
                        {fmt(r.total_price)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            r.payment_status === "paid"
                              ? "badge-paid"
                              : "badge-pending"
                          }
                        >
                          {r.payment_status === "paid"
                            ? "✅ Paid"
                            : "⏳ Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {r.payment_status === "pending" && (
                            <button
                              onClick={() => handleMarkPaid(r)}
                              title="Mark as Paid"
                              className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                              style={{ color: "#16a34a" }}
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditReceipt(r);
                              setShowModal(true);
                            }}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: "#ff7d10" }}
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: "#dc2626" }}
                            title="Delete"
                          >
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
          <ReceiptModal
            workerId={id}
            existing={editReceipt}
            onClose={() => {
              setShowModal(false);
              setEditReceipt(null);
            }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
