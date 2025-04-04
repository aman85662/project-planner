import axios from 'axios';

// Create an axios instance with relative URL (will use Vite's proxy)
const API = axios.create({
  baseURL: '/api',  // Using relative URL to work with Vite proxy
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor for adding the auth token
API.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authAPI = {
  login: (credentials) => API.post('/users/login', credentials),
  register: (userData) => API.post('/users/register', userData),
  getProfile: () => API.get('/users/me'),
  updateProfile: (userData) => API.put('/users/profile', userData),
};

// Student services
export const studentAPI = {
  getAll: (params) => API.get('/students', { params }),
  getById: (id) => API.get(`/students/${id}`),
  create: (data) => API.post('/students', data),
  update: (id, data) => API.put(`/students/${id}`, data),
  delete: (id) => API.delete(`/students/${id}`),
  getStats: () => API.get('/students/stats'),
};

// Project services
export const projectAPI = {
  getAll: (params) => API.get('/projects', { params }),
  getById: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post('/projects', data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
  updateStatus: (id, status) => API.patch(`/projects/${id}/status`, { status }),
  addMilestone: (id, milestone) => API.post(`/projects/${id}/milestones`, milestone),
  updateMilestone: (projectId, milestoneId, data) => 
    API.patch(`/projects/${projectId}/milestones/${milestoneId}`, data),
  deleteMilestone: (projectId, milestoneId) => 
    API.delete(`/projects/${projectId}/milestones/${milestoneId}`),
  addComment: (id, text) => API.post(`/projects/${id}/comments`, { text }),
  getStudentProjects: (studentId) => API.get(`/projects/student/${studentId}`),
};

export default API; 