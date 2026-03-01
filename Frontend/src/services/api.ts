// API service — wired to the real backend at http://localhost:5000
import type { Product, Order, User } from "./mockData";

const API_BASE = (import.meta as any).env.VITE_API_BASE || "http://localhost:5000/api";

/** Helper: get auth header */
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Helper: standardized error thrower */
async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    const err: any = new Error(json.message || "Request failed");
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json as T;
}

// ─── Auth API (REAL backend) ──────────────────────────────────────────────────
export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse<{ message: string; email: string }>(res);
  },
  verifyRegistration: async (email: string, otp: string) => {
    const res = await fetch(`${API_BASE}/auth/verify-registration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    return handleResponse<{ token: string; user: any }>(res);
  },
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ token: string; user: any }>(res);
  },
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { "Content-Type": "application/json", ...authHeader() },
    });
    return handleResponse<{ user: any }>(res);
  },
  updateProfile: async (name: string) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ name }),
    });
    return handleResponse<{ message: string; user: any }>(res);
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse<{ message: string }>(res);
  },
  forgotPassword: async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(res);
  },
  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    return handleResponse<{ message: string }>(res);
  },
  resendOtp: async (email: string, purpose: "registration" | "login" | "password-reset") => {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose }),
    });
    return handleResponse<{ message: string }>(res);
  },
};

// ─── Products API (REAL backend) ──────────────────────────────────────────────
export const productApi = {
  getAll: async (params?: { category?: string; search?: string; sort?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.search) q.set("search", params.search);
    if (params?.sort) q.set("sort", params.sort);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const res = await fetch(`${API_BASE}/products?${q}`);
    return handleResponse<{ products: Product[]; total: number; page: number; pages: number }>(res);
  },
  getById: async (id: string, lang?: string) => {
    const url = lang && lang !== 'en'
      ? `${API_BASE}/products/${id}?lang=${lang}`
      : `${API_BASE}/products/${id}`;
    const res = await fetch(url);
    return handleResponse<{ product: Product; herb: any }>(res);
  },
  getFeatured: async () => {
    const res = await fetch(`${API_BASE}/products/featured`);
    const data = await handleResponse<{ products: Product[] }>(res);
    return data.products;
  },
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/products/categories`);
    const data = await handleResponse<{ categories: string[] }>(res);
    return data.categories;
  },
};

// ─── Orders API (REAL backend) ────────────────────────────────────────────────
export const orderApi = {
  create: async (orderData: { items: any[]; shippingAddress: any }) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(orderData),
    });
    return handleResponse<{ order: any }>(res);
  },
  getMyOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/my`, {
      headers: { ...authHeader() },
    });
    const data = await handleResponse<{ orders: Order[] }>(res);
    return data.orders;
  },
  getAll: async () => {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { ...authHeader() },
    });
    const data = await handleResponse<{ orders: Order[] }>(res);
    return data.orders;
  },
  updateStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ status }),
    });
    return handleResponse<{ order: any }>(res);
  },
};

// ─── Admin API (REAL backend) ─────────────────────────────────────────────────
export const adminApi = {
  getDashboard: async () => {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { ...authHeader() },
    });
    return handleResponse<{ totalUsers: number; totalOrders: number; totalRevenue: number; totalProducts: number }>(res);
  },
  getUsers: async () => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { ...authHeader() },
    });
    const data = await handleResponse<{ users: any[] }>(res);
    return data.users;
  },
  deleteUser: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: "DELETE",
      headers: { ...authHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },
  updateUserRole: async (id: string, role: "user" | "admin") => {
    const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ role }),
    });
    return handleResponse<{ message: string; user: any }>(res);
  },
  getProducts: async () => {
    const res = await fetch(`${API_BASE}/products?limit=100`, {
      headers: { ...authHeader() },
    });
    const data = await handleResponse<{ products: Product[] }>(res);
    return data.products;
  },
  addProduct: async (product: Partial<Product>) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(product),
    });
    return handleResponse<{ product: Product }>(res);
  },
  updateProduct: async (id: string, product: Partial<Product>) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(product),
    });
    return handleResponse<{ product: Product }>(res);
  },
  deleteProduct: async (id: string) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
      headers: { ...authHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },
  getHerbs: async () => {
    const res = await fetch(`${API_BASE}/admin/herbs`, {
      headers: { ...authHeader() },
    });
    const data = await handleResponse<{ herbs: any[] }>(res);
    return data.herbs;
  },
  addHerb: async (herb: any) => {
    const res = await fetch(`${API_BASE}/admin/herbs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(herb),
    });
    return handleResponse<{ herb: any }>(res);
  },
  updateHerb: async (id: string, herb: any) => {
    const res = await fetch(`${API_BASE}/admin/herbs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(herb),
    });
    return handleResponse<{ herb: any }>(res);
  },
  deleteHerb: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/herbs/${id}`, {
      method: "DELETE",
      headers: { ...authHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },
};

// Re-export types
export type { Product, Order, User };
