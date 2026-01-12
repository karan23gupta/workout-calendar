const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('auth_token')
}

// Helper function to make authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })
  
  if (response.status === 401) {
    // Token expired or invalid, clear it
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    throw new Error('Unauthorized - Please login again')
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || 'Request failed')
  }
  
  return response.json()
}

// Authentication functions
export const register = async (username, email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Registration failed' }))
    throw new Error(error.detail || 'Registration failed')
  }
  
  const data = await response.json()
  // Store token and user info
  localStorage.setItem('auth_token', data.access_token)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data
}

export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Login failed' }))
    throw new Error(error.detail || 'Login failed')
  }
  
  const data = await response.json()
  // Store token and user info
  localStorage.setItem('auth_token', data.access_token)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data
}

export const logout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
}

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const isAuthenticated = () => {
  return !!getToken()
}

// Workout functions (require authentication)
export const fetchWorkouts = async () => {
  return fetchWithAuth('/api/workouts')
}

export const createWorkout = async (dateString, imageFile, notes) => {
  const token = getToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const formData = new FormData()
  formData.append('workout_date', dateString)
  formData.append('image', imageFile)
  if (notes) {
    formData.append('notes', notes)
  }

  const response = await fetch(`${API_BASE_URL}/api/workouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })

  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    throw new Error('Unauthorized - Please login again')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create workout' }))
    throw new Error(error.detail || 'Failed to create workout')
  }

  return response.json()
}

export const deleteWorkout = async (dateString) => {
  return fetchWithAuth(`/api/workouts/${dateString}`, {
    method: 'DELETE',
  })
}

export const fetchStreaks = async () => {
  return fetchWithAuth('/api/streaks')
}

export const getCurrentUserInfo = async () => {
  return fetchWithAuth('/api/me')
}

export const fetchLeaderboard = async () => {
  return fetchWithAuth('/api/leaderboard')
}
