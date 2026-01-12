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
    return rank
  }

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-first'
    if (rank === 2) return 'rank-second'
    if (rank === 3) return 'rank-third'
    return ''
  }

  const getCurrentMonth = () => {
    const now = new Date()
    return now.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-info">
          <div className="month-indicator">📅 {getCurrentMonth()}</div>
        </div>
        <div className="loading">Loading leaderboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-info">
          <div className="month-indicator">📅 {getCurrentMonth()}</div>
        </div>
        <div className="error">Error loading leaderboard: {error}</div>
      </div>
    )
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-info">
        <div className="month-indicator">📅 {getCurrentMonth()}</div>
        <div className="leaderboard-note">Ranked by monthly workouts, current streak, and longest streak</div>
      </div>
      
      {leaderboard.length === 0 ? (
        <div className="empty-leaderboard">No users yet. Be the first to log a workout!</div>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th className="col-rank">Rank</th>
              <th className="col-username">User</th>
              <th className="col-stat">Monthly Workouts</th>
              <th className="col-stat">Current Streak</th>
              <th className="col-stat">Longest Streak</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => {
              const isCurrentUser = entry.user_id === currentUserId
              return (
                <tr
                  key={entry.user_id}
                  className={`leaderboard-row ${getRankClass(entry.rank)} ${isCurrentUser ? 'current-user' : ''}`}
                >
                  <td className="row-rank">
                    <span className="rank-icon">{getRankIcon(entry.rank)}</span>
                  </td>
                  <td className="row-username">
                    <span className="username-text">@{entry.username}</span>
                    {isCurrentUser && <span className="you-badge">You</span>}
                  </td>
                  <td className="row-stat">{entry.total_workouts}</td>
                  <td className="row-stat">{entry.current_streak}</td>
                  <td className="row-stat">{entry.longest_streak}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Leaderboard
