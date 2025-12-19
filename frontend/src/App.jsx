import React, { useState, useEffect } from 'react'
import Calendar from './components/Calendar'
import StreakDisplay from './components/StreakDisplay'
import { fetchWorkouts, toggleWorkout, fetchStreaks } from './api'
import './App.css'

function App() {
  const [workouts, setWorkouts] = useState(new Set())
  const [streaks, setStreaks] = useState({ current_streak: 0, longest_streak: 0 })
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    loadData()
  }, [currentDate])

  const loadData = async () => {
    try {
      setLoading(true)
      const [workoutsData, streaksData] = await Promise.all([
        fetchWorkouts(),
        fetchStreaks()
      ])
      
      const workoutDates = new Set(workoutsData.map(w => w.date))
      setWorkouts(workoutDates)
      setStreaks(streaksData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = async (dateString) => {
    try {
      await toggleWorkout(dateString)
      await loadData() // Reload to get updated streaks
    } catch (error) {
      console.error('Error toggling workout:', error)
    }
  }

  const handleMonthChange = (newDate) => {
    setCurrentDate(newDate)
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Workout Calendar</h1>
        <p className="subtitle">Track your fitness journey</p>
      </header>
      
      <StreakDisplay 
        currentStreak={streaks.current_streak}
        longestStreak={streaks.longest_streak}
      />
      
      <Calendar
        currentDate={currentDate}
        workouts={workouts}
        onDateClick={handleDateClick}
        onMonthChange={handleMonthChange}
      />
    </div>
  )
}

export default App

