import api from './axiosInstance';

export const authAPI = {
  // Register
  register: (data) => api.post('/auth/register', data),

  // Login
  login: (data) => api.post('/auth/login', data),

  // Logout
  logout: () => api.post('/auth/logout'),

  // Get current user
  getMe: () => api.get('/auth/me'),

  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  // Reset password
  resetPassword: (token, password) =>
    api.patch(`/auth/reset-password/${token}`, { password }),

  // Change password
  changePassword: (data) => api.patch('/auth/change-password', data),

  // Refresh token
  refreshToken: (refreshToken) =>
    api.post('/auth/refresh-token', { refreshToken }),
};
