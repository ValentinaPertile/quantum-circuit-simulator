import React from 'react'

function Header({ theme, onToggleTheme, onBackToHome }) {
  return (
    <header className="header">
      <div className="header-title">
        <h1>Quantum Circuit Simulator</h1>
        <div>
          <div className="header-subtitle">Build and simulate quantum circuits</div>
        </div>
      </div>
      <div className="header-controls">
        <button className="theme-toggle" onClick={onToggleTheme}>
          <span>☾/☀︎</span>
        </button>
        <button className="btn btn-secondary" onClick={onBackToHome}>
          Back to Home
        </button>
      </div>
    </header>
  )
}

export default Header