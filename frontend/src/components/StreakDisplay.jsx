import React from 'react'
import './StreakDisplay.css'

function StreakDisplay({ currentStreak, longestStreak }) {
  return (
    <div className="streak-display">
      <div className="streak-card">
        <div className="streak-label">Current Streak</div>
        <div className="streak-value">{currentStreak}</div>
        <div className="streak-unit">days</div>
      </div>
      <div className="streak-card">
        <div className="streak-label">Longest Streak</div>
        <div className="streak-value">{longestStreak}</div>
        <div className="streak-unit">days</div>
      </div>
    </div>
  )
}

export default StreakDisplay

