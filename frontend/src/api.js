const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const fetchWorkouts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/workouts`)
  if (!response.ok) {
    throw new Error('Failed to fetch workouts')
  }
  return response.json()
}

export const toggleWorkout = async (dateString) => {
  const response = await fetch(`${API_BASE_URL}/api/workouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ date: dateString }),
  })
  if (!response.ok) {
    throw new Error('Failed to toggle workout')
  }
  return response.json()
}

export const fetchStreaks = async () => {
  const response = await fetch(`${API_BASE_URL}/api/streaks`)
  if (!response.ok) {
    throw new Error('Failed to fetch streaks')
  }
  return response.json()
}

