import api from './axiosInstance';

export const productAPI = {
  // Get all products (public)
  getAll: (params) => api.get('/products', { params }),

  // Get single product
  getById: (id) => api.get(`/products/${id}`),

  // Get merchant's own products
  getMyProducts: (params) => api.get('/products/merchant/my-products', { params }),

  // Create product (merchant)
  create: (formData) =>
    api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update product (merchant)
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Delete product (merchant)
  delete: (id) => api.delete(`/products/${id}`),

  // Delete single image
  deleteImage: (id, publicId) =>
    api.delete(`/products/${id}/image`, { data: { publicId } }),
};
