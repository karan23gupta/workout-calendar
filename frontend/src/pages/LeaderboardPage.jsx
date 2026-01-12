import React from 'react'
import Leaderboard from '../components/Leaderboard'
import Navigation from '../components/Navigation'
import { getCurrentUser } from '../api'
import './LeaderboardPage.css'

function LeaderboardPage() {
  const user = getCurrentUser()

  return (
    <div className="leaderboard-page">
      <Navigation />
      <header className="leaderboard-page-header">
        <div className="header-content">
          <div>
            <h1>🏆 Leaderboard</h1>
            <p className="subtitle">Monthly rankings - resets every month</p>
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
