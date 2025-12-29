  import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token sent:', token.substring(0, 20) + '...');
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API calls
export const authAPI = {
  register: (email, password, fullName) =>
    apiClient.post('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    }),
  login: (email, password) =>
    apiClient.post('/api/auth/login', {
      email,
      password,
    }),
  logout: () => apiClient.post('/api/auth/logout'),
};

// Todo API calls
export const todoAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.completed !== undefined) params.append('completed', filters.completed);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.sortOrder) params.append('sort_order', filters.sortOrder);

    const query = params.toString();
    return apiClient.get(`/api/todos${query ? '?' + query : ''}`);
  },
  getById: (id) => apiClient.get(`/api/todos/${id}`),
  create: (title, description = '', priority = 'medium', tags = [], dueDate = null) =>
    apiClient.post('/api/todos', {
      title,
      description,
      priority,
      tags,
      due_date: dueDate,
      completed: false,
    }),
  update: (id, data) => apiClient.put(`/api/todos/${id}`, data),
  markDone: (id) => apiClient.put(`/api/todos/${id}/done`),
  markUndone: (id) => apiClient.put(`/api/todos/${id}/undone`),
  delete: (id) => apiClient.delete(`/api/todos/${id}`),
  getStatistics: () => apiClient.get('/api/todos/statistics'),
  getTags: () => apiClient.get('/api/todos/tags'),
};
