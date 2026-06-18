import axios from 'axios'

const BASE_URL = 'https://ems-backend-h422.onrender.com'

const TOKEN_KEY = 'ems_token'
const USER_KEY = 'ems_user'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const employeeService = {
  getAll: () => api.get('/employees').then(r => r.data),
  getById: (id) => api.get(`/employees/${id}`).then(r => r.data),
  create: (data) => api.post('/employees', data).then(r => r.data),
  update: (id, data) => api.put(`/employees/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/employees/${id}`).then(r => r.data),
}

export const departmentService = {
  getAll: () => api.get('/departments').then(r => r.data),
  getById: (id) => api.get(`/departments/${id}`).then(r => r.data),
  create: (data) => api.post('/departments', data).then(r => r.data),
  update: (id, data) => api.put(`/departments/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/departments/${id}`).then(r => r.data),
}

export const settingsService = {
  get: async () => {
    const response = await api.get('/settings')
    return response.data
  },
  update: async (data) => {
    const response = await api.put('/settings', data)
    return response.data
  }
}

export const authService = {
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  changePassword: (data) => api.put("/auth/change-password", data).then(r => r.data),

  saveSession: ({ token, fullName, email, role }) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify({ fullName, email, role }))
  },

  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  getUser: () => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  },

  isAuthenticated: () => Boolean(localStorage.getItem(TOKEN_KEY)),
}

export const userService = {
  getCurrentUser: () => api.get('/users/me').then(res => res.data),
  updateName: (data) => api.put('/users/me/name', data).then(r => r.data),
}

export const taskService = {
  // ADMIN only
  createTask: (data) => api.post('/tasks', data).then(r => r.data),
  getAllTasks: () => api.get('/tasks/all').then(r => r.data),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`).then(r => r.data),
  updateTask: (taskId, data) => api.put(`/tasks/${taskId}`, data).then(r => r.data),

  // USER + ADMIN
  getMyTasks: () => api.get('/tasks/my').then(r => r.data),
  updateStatus: (assignmentId, status) =>
    api.put(`/tasks/${assignmentId}/status`, { status }).then(r => r.data),
}