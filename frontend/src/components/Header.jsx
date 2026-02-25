import React, { useState, useEffect, useRef } from 'react'

function Header({ theme, onToggleTheme, onBackToHome }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  return (
    <header className="header">
      <div className="header-left">
        {/* Hamburger menu - left of title */}
        <div className="header-menu" ref={menuRef}>
          <button
            className="menu-trigger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>

          {menuOpen && (
            <div className="menu-dropdown">
              <button className="menu-item" onClick={() => { setMenuOpen(false); onBackToHome() }}>
                <span className="menu-icon">⌂</span>
                <span>Home</span>
              </button>
              <div className="menu-divider" />
              <button className="menu-item" onClick={() => { onToggleTheme(); setMenuOpen(false) }}>
                <span className="menu-icon">{theme === 'light' ? '☾' : '☀︎'}</span>
                <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="header-title">
          <h1>Quantum Circuit Simulator</h1>
        </div>
      </div>
    </header>
  )
}

export default Header