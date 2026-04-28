import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (username, password) => api.post("/api/login", { username, password }),
  me: () => api.get("/api/me"),
};

export const dashboardAPI = {
  get: () => api.get("/api/dashboard"),
};

export const workersAPI = {
  list: () => api.get("/api/workers"),
  create: (data) => api.post("/api/workers", data),
  update: (id, data) => api.put(`/api/workers/${id}`, data),
  delete: (id) => api.delete(`/api/workers/${id}`),
  getReceipts: (id) => api.get(`/api/workers/${id}/receipts`),
  addReceipt: (id, data) => api.post(`/api/workers/${id}/receipts`, data),
  updateReceipt: (receiptId, data) => api.put(`/api/receipts/${receiptId}`, data),
  deleteReceipt: (receiptId) => api.delete(`/api/receipts/${receiptId}`),
};

export const sellersAPI = {
  list: () => api.get("/api/sellers"),
  create: (data) => api.post("/api/sellers", data),
  delete: (id) => api.delete(`/api/sellers/${id}`),
  getSales: (id) => api.get(`/api/sellers/${id}/sales`),
  addSale: (id, data) => api.post(`/api/sellers/${id}/sales`, data),
  updateSale: (saleId, data) => api.put(`/api/sales/${saleId}`, data),
  deleteSale: (saleId) => api.delete(`/api/sales/${saleId}`),
};

export default api;
