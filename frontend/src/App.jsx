import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import CalendarPage from './pages/CalendarPage'
import LeaderboardPage from './pages/LeaderboardPage'
import { isAuthenticated, getCurrentUser } from './api'
import './App.css'

function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated())
  const [user, setUser] = useState(getCurrentUser())

  const handleLoginSuccess = () => {
    setAuthenticated(true)
    setUser(getCurrentUser())
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            authenticated ? (
              <Navigate to="/calendar" replace />
            ) : (
              <div className="app">
                <header className="app-header">
                  <h1>Workout Calendar</h1>
                  <p className="subtitle">Track your fitness journey</p>
                </header>
                <Login onLoginSuccess={handleLoginSuccess} />
              </div>
            )
          }
        />
        <Route
          path="/calendar"
          element={
            authenticated ? (
              <CalendarPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/leaderboard"
          element={
            authenticated ? (
              <LeaderboardPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

