import React from 'react'
import './Calendar.css'

function Calendar({ currentDate, workouts, onDateClick, onMonthChange }) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1)
    onMonthChange(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1, 1)
    onMonthChange(newDate)
  }

  const formatDateString = (year, month, day) => {
    // month is 0-indexed (0-11), so add 1 to get actual month (1-12)
    const monthStr = String(month + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${year}-${monthStr}-${dayStr}`
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isWorkoutDay = (day) => {
    // month is already 0-indexed, formatDateString will add 1
    const dateString = formatDateString(year, month, day)
    return workouts.has(dateString)
  }

  const getWorkoutForDay = (day) => {
    const dateString = formatDateString(year, month, day)
    return workouts.get(dateString)
  }

  const canClickDay = (day) => {
    const dateString = formatDateString(year, month, day)
    const today = new Date().toISOString().split('T')[0]
    return dateString === today
  }

  const handleDayClick = (day) => {
    if (!canClickDay(day)) {
      return // Only allow clicking today
    }
    // month is already 0-indexed, formatDateString will add 1
    const dateString = formatDateString(year, month, day)
    onDateClick(dateString)
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // month is already 0-indexed, formatDateString will add 1
      const dateString = formatDateString(year, month, day)
      const workout = getWorkoutForDay(day)
      const today = isToday(day)
      const clickable = canClickDay(day)
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${workout ? 'workout' : ''} ${today ? 'today' : ''} ${!clickable ? 'disabled' : ''}`}
          onClick={() => handleDayClick(day)}
          title={!clickable ? (today ? 'Click to mark workout' : 'You can only mark today\'s workout') : (workout ? 'View workout details' : 'Mark workout as done')}
        >
          <span className="day-number">{day}</span>
          {workout && <span className="workout-indicator">✓</span>}
        </div>
      )
    }

    return days
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="nav-button" onClick={handlePrevMonth}>
          ←
        </button>
        <h2 className="month-year">
          {monthNames[month]} {year}
        </h2>
        <button className="nav-button" onClick={handleNextMonth}>
          →
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {dayNames.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {renderCalendarDays()}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-box today"></div>
          <span>Today</span>
        </div>
        <div className="legend-item">
          <div className="legend-box workout"></div>
          <span>Workout Done</span>
        </div>
      </div>
    </div>
  )
}

export default Calendar

