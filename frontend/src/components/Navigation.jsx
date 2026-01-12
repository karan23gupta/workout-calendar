import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { logout, getCurrentUser } from '../api'
import './Navigation.css'

function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(getCurrentUser())
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setUser(getCurrentUser())
  }, [location])

  const handleLogout = () => {
    logout()
    setUser(null)
    setIsOpen(false)
    navigate('/')
  }

  const handleNavigation = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  const menuItems = [
    { path: '/calendar', label: '📅 Calendar', icon: '📅' },
    { path: '/leaderboard', label: '🏆 Leaderboard', icon: '🏆' },
    // Future items can be added here easily:
    // { path: '/stats', label: '📊 Statistics', icon: '📊' },
    // { path: '/profile', label: '👤 Profile', icon: '👤' },
  ]

  return (
    <>
      <button 
        className="hamburger-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span className={`hamburger-icon ${isOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <div className={`nav-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}></div>

      <nav className={`nav-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="nav-header">
          <div className="nav-user-info">
            <div className="nav-username">@{user?.username}</div>
            <div className="nav-user-label">Logged in</div>
          </div>
        </div>

        <div className="nav-menu">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                className={`nav-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="nav-menu-icon">{item.icon}</span>
                <span className="nav-menu-label">{item.label}</span>
                {isActive && <span className="nav-active-indicator">●</span>}
              </button>
            )
          })}
        </div>

        <div className="nav-footer">
          <button className="nav-logout-button" onClick={handleLogout}>
            <span className="nav-menu-icon">🚪</span>
            <span className="nav-menu-label">Logout</span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default Navigation
