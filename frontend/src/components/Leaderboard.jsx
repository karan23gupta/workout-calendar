import React, { useState, useEffect } from 'react'
import { fetchLeaderboard } from '../api'
import './Leaderboard.css'

function Leaderboard({ currentUserId }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchLeaderboard()
      setLeaderboard(data)
    } catch (err) {
      console.error('Error loading leaderboard:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-first'
    if (rank === 2) return 'rank-second'
    if (rank === 3) return 'rank-third'
    return ''
  }

  if (loading) {
    return (
      <div className="leaderboard-container">
        <h2 className="leaderboard-title">🏆 Leaderboard</h2>
        <div className="loading">Loading leaderboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <h2 className="leaderboard-title">🏆 Leaderboard</h2>
        <div className="error">Error loading leaderboard: {error}</div>
      </div>
    )
  }

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">🏆 Leaderboard</h2>
      <p className="leaderboard-subtitle">Ranked by total workouts, current streak, and longest streak</p>
      
      {leaderboard.length === 0 ? (
        <div className="empty-leaderboard">No users yet. Be the first to log a workout!</div>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <div className="header-rank">Rank</div>
            <div className="header-username">User</div>
            <div className="header-stat">Total</div>
            <div className="header-stat">Current</div>
            <div className="header-stat">Longest</div>
          </div>
          
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.user_id === currentUserId
            return (
              <div
                key={entry.user_id}
                className={`leaderboard-row ${getRankClass(entry.rank)} ${isCurrentUser ? 'current-user' : ''}`}
              >
                <div className="row-rank">
                  <span className="rank-icon">{getRankIcon(entry.rank)}</span>
                </div>
                <div className="row-username">
                  <span className="username-text">@{entry.username}</span>
                  {isCurrentUser && <span className="you-badge">You</span>}
                </div>
                <div className="row-stat" data-label="Total Workouts">{entry.total_workouts}</div>
                <div className="row-stat" data-label="Current Streak">{entry.current_streak}</div>
                <div className="row-stat" data-label="Longest Streak">{entry.longest_streak}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Leaderboard
