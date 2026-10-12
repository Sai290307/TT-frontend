import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Every request automatically carries the login token (if we have one).
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// If a request fails with 401, try the refresh token once, then retry.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
            params: { refreshToken },
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// One small object per feature. Each function = one backend endpoint.
export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh', null, { params: { refreshToken } }),
};

export const buildingApi = {
  getAll: () => api.get('/buildings'),
  getById: (id) => api.get(`/buildings/${id}`),
  create: (data) => api.post('/buildings', data),
  update: (id, data) => api.put(`/buildings/${id}`, data),
  delete: (id) => api.delete(`/buildings/${id}`),
};

export const unitApi = {
  getAll: (buildingId) => api.get('/units', { params: { buildingId } }),
  getVacant: (buildingId) => api.get('/units/vacant', { params: { buildingId } }),
  getById: (id) => api.get(`/units/${id}`),
  getByNumber: (unitNumber) => api.get(`/units/by-number/${unitNumber}`),
  create: (data) => api.post('/units', data),
  update: (id, data) => api.put(`/units/${id}`, data),
  assignResident: (id, residentId) => api.put(`/units/${id}/assign-resident`, { residentId }),
  vacate: (id) => api.put(`/units/${id}/vacate`),
  delete: (id) => api.delete(`/units/${id}`),
};

export const announcementApi = {
  getAll: (buildingId) => api.get('/announcements', { params: { buildingId } }),
  getActive: (buildingId) => api.get('/announcements/active', { params: { buildingId } }),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  publish: (id) => api.put(`/announcements/${id}/publish`),
  unpublish: (id) => api.put(`/announcements/${id}/unpublish`),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const issueApi = {
  getAll: () => api.get('/issues'),
  getMyIssues: () => api.get('/issues/my'),
  getAssigned: () => api.get('/issues/assigned'),
  getById: (id) => api.get(`/issues/${id}`),
  create: (data) => api.post('/issues', data),
  update: (id, data) => api.put(`/issues/${id}`, data),
  assign: (id, technicianId) => api.put(`/issues/${id}/assign`, { technicianId }),
  updateStatus: (id, status) => api.put(`/issues/${id}/status`, { status }),
  delete: (id) => api.delete(`/issues/${id}`),
};

export default api;