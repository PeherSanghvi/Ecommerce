import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Orders
export const getOrders = (page = 1, limit = 20, status = "") =>
  api.get("/orders", { params: { page, limit, ...(status ? { status } : {}) } });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const getOrdersByCustomer = (customerId, page = 1, limit = 20) =>
  api.get(`/orders/customer/${customerId}`, { params: { page, limit } });
export const checkout = (payload) => api.post("/orders", payload);
export const updateOrderStatus = (id, body) => api.patch(`/orders/${id}/status`, body);

// Products
// page is 1-based; backend param is "limit" not "size"
export const getProducts = (page = 1, limit = 20, params = {}) =>
  api.get("/products", { params: { page, limit, ...params } });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get("/products/categories");
export const getCategoriesHierarchy = () => api.get("/products/categories/hierarchy");
export const createProduct = (body) => api.post("/products", body);
export const updateProduct = (id, body) => api.put(`/products/${id}`, body);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Users
export const getUsers = () => api.get("/users");
export const getUser = (id) => api.get(`/users/${id}`);

// Search
export const searchOrders = (params) => api.post("/search/orders", params);
export const getKpis = () => api.post("/search/orders", { page: 0, size: 0 });
export const reindex = () => api.post("/admin/reindex");

// Health
export const getHealth = () => api.get("/health");

export default api;
