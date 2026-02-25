import React, { useState, useEffect, useRef } from 'react'
import { drawCircuit } from '../utils/circuitDrawer'

export function saveSimulationToHistory(numQubits, operations, amplitudes) {
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

function SimulationHistory() {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState([])
  const panelRef = useRef(null)

  useEffect(() => {
    if (open) loadHistory()
  }, [open])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
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
    <div className="sim-history-wrapper" ref={panelRef}>
      <button className="btn btn-secondary" onClick={() => setOpen(!open)}>
        ◷ History
      </button>

      {open && (
        <div className="sim-history-dropdown">
          <div className="sim-history-header">
            <span className="sim-history-title">Simulation History</span>
            {history.length > 0 && (
              <button className="sim-history-clear" onClick={clearHistory}>Clear</button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="sim-history-empty">No simulations yet. Run one to see it here.</div>
          ) : (
            <div className="sim-history-list">
              {history.map((item, idx) => (
                <HistoryItem key={idx} item={item} formatDate={formatDate} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function HistoryItem({ item, formatDate }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (svgRef.current && item.operations?.length > 0) {
      try { drawCircuit(svgRef.current, item.numQubits, item.operations) } catch (e) {}
    }
  }, [item])

  return (
    <div className="sim-history-item">
      <div className="sim-history-item-meta">
        <span className="sim-history-date">{formatDate(item.timestamp)}</span>
        <span className="sim-history-badge">{item.numQubits}q · {item.operations.length} gates</span>
      </div>

      <div className="sim-history-preview">
        <svg ref={svgRef} width="260" height="80" style={{ display: 'block' }} />
      </div>

      {item.probabilities && Object.keys(item.probabilities).length > 0 && (
        <div className="sim-history-probs">
          {Object.entries(item.probabilities).map(([state, prob]) => (
            <div key={state} className="sim-history-prob-row">
              <span className="sim-history-prob-state">|{state}⟩</span>
              <div className="sim-history-prob-bg">
                <div className="sim-history-prob-fill" style={{ width: `${(prob * 100).toFixed(0)}%` }} />
              </div>
              <span className="sim-history-prob-val">{(prob * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SimulationHistory