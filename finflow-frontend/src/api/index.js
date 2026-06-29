import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const register = (data) => api.post('/auth/register', data)
export const login    = (data) => api.post('/auth/login', data)
export const getMe    = ()     => api.get('/auth/me')

export const getTransactions   = ()       => api.get('/transactions')
export const addTransaction    = (data)   => api.post('/transactions', data)
export const deleteTransaction = (id)     => api.delete(`/transactions/${id}`)

export const getBudgets   = ()         => api.get('/budgets')
export const addBudget    = (data)     => api.post('/budgets', data)
export const updateBudget = (id, data) => api.put(`/budgets/${id}`, data)
export const deleteBudget = (id)       => api.delete(`/budgets/${id}`)

export const getGoals   = ()         => api.get('/goals')
export const addGoal    = (data)     => api.post('/goals', data)
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data)
export const deleteGoal = (id)       => api.delete(`/goals/${id}`)

export const getDashboardSummary = () => api.get('/dashboard/summary')

export const sendChatMessage = (messages, context) =>
  api.post('/chat', { messages, context })

export default api