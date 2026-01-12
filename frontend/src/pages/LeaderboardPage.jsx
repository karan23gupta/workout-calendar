import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Leaderboard from '../components/Leaderboard'
import { getCurrentUser, logout } from '../api'
import './LeaderboardPage.css'

function LeaderboardPage() {
  const [user, setUser] = useState(getCurrentUser())
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate('/')
  }

  const handleBackToCalendar = () => {
    navigate('/')
  }

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-page-header">
        <div className="header-content">
          <div>
            <h1>🏆 Leaderboard</h1>
            <p className="subtitle">Monthly rankings - resets every month</p>
          </div>
          <div className="user-info">
            <span className="username">@{user?.username}</span>
            <button className="nav-button" onClick={handleBackToCalendar}>
              Calendar
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="leaderboard-page-content">
        <Leaderboard currentUserId={user?.id} />
      </div>
    </div>
  )
}

export default LeaderboardPage
