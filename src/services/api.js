const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('meddibuddy_token')
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiRequest(endpoint, options = {}) {
  const { body, method = 'GET', headers = {}, isFormData = false } = options

  const config = {
    method,
    headers: {
      ...authHeaders(),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  }

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (response.status === 429) {
    throw new Error('Our AI is busy right now. Please wait 30-60 seconds and try again.')
  }

  if (response.status === 401) {
    localStorage.removeItem('meddibuddy_token')
    window.location.href = '/login'
    throw new Error('Session expired. Please log in again.')
  }

  if (response.status === 204) {
    return null
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || 'Something went wrong')
  }

  return data
}

export function register(name, email, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  })
}

export function login(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function getMe() {
  return apiRequest('/api/auth/me')
}

export function analyzeMedicine(file, language = 'en') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('language', language)
  return apiRequest('/api/analyze', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export function getAnalyses(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiRequest(`/api/analyses${params}`)
}

export function getAnalysis(id) {
  return apiRequest(`/api/analyses/${id}`)
}

export function deleteAnalysis(id) {
  return apiRequest(`/api/analyses/${id}`, { method: 'DELETE' })
}
