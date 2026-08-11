/**
 * Central API client for SmartShop Lite.
 * Change API_BASE_URL if the backend runs somewhere other than localhost:5000.
 */
const API_BASE_URL = window.SMARTSHOP_API_BASE_URL || 'http://43.204.147.161:5000/api';
async function handleResponse(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // no JSON body (e.g. 204)
  }
  if (!res.ok) {
    const message = (data && data.message) || `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data;
}

const api = {
  /** Fetch a page of products with optional filters: { search, category, minPrice, maxPrice, sort, page, limit } */
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value);
      }
    });
    const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
    return handleResponse(res);
  },

  async getCategories() {
    const res = await fetch(`${API_BASE_URL}/products/categories`);
    return handleResponse(res);
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse(res);
  },

  async createProduct(product, adminKey) {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify(product),
    });
    return handleResponse(res);
  },

  async updateProduct(id, product, adminKey) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify(product),
    });
    return handleResponse(res);
  },

  async deleteProduct(id, adminKey) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': adminKey },
    });
    return handleResponse(res);
  },
};
