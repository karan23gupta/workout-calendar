import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from '../components/Calendar'
import StreakDisplay from '../components/StreakDisplay'
import WorkoutModal from '../components/WorkoutModal'
import { fetchWorkouts, fetchStreaks, isAuthenticated, getCurrentUser, logout } from '../api'
import '../App.css'

function CalendarPage() {
  const [workouts, setWorkouts] = useState(new Map())
  const [streaks, setStreaks] = useState({ current_streak: 0, longest_streak: 0 })
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [user, setUser] = useState(getCurrentUser())
  const [selectedDate, setSelectedDate] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/')
      return
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate])

  const loadData = async () => {
    try {
      setLoading(true)
      const [workoutsData, streaksData] = await Promise.all([
        fetchWorkouts(),
        fetchStreaks()
      ])
      
      const workoutsMap = new Map()
      workoutsData.forEach(w => {
        workoutsMap.set(w.date, w)
      })
      setWorkouts(workoutsMap)
      setStreaks(streaksData)
    } catch (error) {
      console.error('Error loading data:', error)
      if (error.message.includes('Unauthorized')) {
        handleLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = (dateString) => {
    setSelectedDate(dateString)
    setModalOpen(true)
  }

  const handleWorkoutUpdated = () => {
    loadData()
  }

  const handleMonthChange = (newDate) => {
    setCurrentDate(newDate)
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    setWorkouts(new Map())
    setStreaks({ current_streak: 0, longest_streak: 0 })
    navigate('/')
  }

  const handleLeaderboardClick = () => {
    navigate('/leaderboard')
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
        <div className="header-content">
          <div>
            <h1>Workout Calendar</h1>
            <p className="subtitle">Track your fitness journey</p>
          </div>
          <div className="user-info">
            <span className="username">@{user?.username}</span>
            <button className="nav-button" onClick={handleLeaderboardClick}>
              🏆 Leaderboard
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
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

      <WorkoutModal
        date={selectedDate}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedDate(null)
        }}
        existingWorkout={selectedDate ? workouts.get(selectedDate) : null}
        onWorkoutUpdated={handleWorkoutUpdated}
      />
    </div>
  )
}

export default CalendarPage
