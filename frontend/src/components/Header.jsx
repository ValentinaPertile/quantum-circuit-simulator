import React, { useState, useEffect, useRef } from 'react'
import { drawCircuit } from '../utils/circuitDrawer'

function Header({ theme, onToggleTheme, onBackToHome }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState([])
  const menuRef = useRef(null)

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
        setHistoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const loadHistory = () => {
    const data = localStorage.getItem('simulation_history')
    setHistory(data ? JSON.parse(data) : [])
  }

  const clearHistory = () => {
    localStorage.removeItem('simulation_history')
    setHistory([])
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <header className="header">
      <div className="header-title">
        <h1>Quantum Circuit Simulator</h1>

      </div>

      <div className="header-menu" ref={menuRef}>
        <button
          className="menu-trigger"
          onClick={() => { setMenuOpen(!menuOpen); setHistoryOpen(false) }}
          aria-label="Menu"
        >
          ⋮
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

            <div className="menu-divider" />

            <button
              className="menu-item"
              onClick={() => { setHistoryOpen(!historyOpen); loadHistory() }}
            >
              <span className="menu-icon">◷</span>
              <span>History</span>
              <span className="menu-arrow">{historyOpen ? '▲' : '▼'}</span>
            </button>

            {historyOpen && (
              <div className="history-panel">
                {history.length === 0 ? (
                  <div className="history-empty">No simulations yet</div>
                ) : (
                  <>
                    <div className="history-list">
                      {history.map((item, idx) => (
                        <HistoryItem key={idx} item={item} formatDate={formatDate} />
                      ))}
                    </div>
                    <button className="history-clear" onClick={clearHistory}>
                      Clear history
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

function HistoryItem({ item, formatDate }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (svgRef.current && item.operations && item.numQubits) {
      try {
        drawCircuit(svgRef.current, item.numQubits, item.operations)
      } catch (e) {}
    }
  }, [item])

  return (
    <div className="history-item">
      <div className="history-item-meta">
        <span className="history-item-date">{formatDate(item.timestamp)}</span>
        <span className="history-item-info">
          {item.numQubits}q · {item.operations.length} gates
        </span>
      </div>
      <div className="history-circuit-preview">
        <svg ref={svgRef} width="220" height="70" style={{ display: 'block' }} />
      </div>
      {item.probabilities && Object.keys(item.probabilities).length > 0 && (
        <div className="history-probs">
          {Object.entries(item.probabilities).map(([state, prob]) => (
            <div key={state} className="history-prob-row">
              <span className="history-prob-state">|{state}⟩</span>
              <div className="history-prob-bar-bg">
                <div className="history-prob-bar" style={{ width: `${(prob * 100).toFixed(0)}%` }} />
              </div>
              <span className="history-prob-val">{(prob * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function saveToHistory(numQubits, operations, amplitudes) {
  const MAX = 10
  const data = localStorage.getItem('simulation_history')
  const history = data ? JSON.parse(data) : []

  const probabilities = {}
  if (amplitudes) {
    Object.entries(amplitudes).forEach(([state, amp]) => {
      probabilities[state] = amp.probability
    })
  }

  const entry = {
    timestamp: new Date().toISOString(),
    numQubits,
    operations: [...operations],
    probabilities,
  }

  const updated = [entry, ...history].slice(0, MAX)
  localStorage.setItem('simulation_history', JSON.stringify(updated))
}

export default Header