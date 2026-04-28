import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Workers from "./pages/Workers";
import WorkerDetail from "./pages/WorkerDetail";
import Sellers from "./pages/Sellers";
import SellerDetail from "./pages/SellerDetail";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#fdf8f0" }}>
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🪬</div>
        <p style={{ color: "#a0522d", fontFamily: "'DM Sans', sans-serif" }}>Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            borderRadius: "12px",
            border: "1px solid rgba(255,125,16,0.2)",
          },
          success: { iconTheme: { primary: "#ff7d10", secondary: "white" } },
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/workers" element={<PrivateRoute><Workers /></PrivateRoute>} />
          <Route path="/workers/:id" element={<PrivateRoute><WorkerDetail /></PrivateRoute>} />
          <Route path="/sellers" element={<PrivateRoute><Sellers /></PrivateRoute>} />
          <Route path="/sellers/:id" element={<PrivateRoute><SellerDetail /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
