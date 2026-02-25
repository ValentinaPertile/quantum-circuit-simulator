import React, { useState, useEffect } from 'react'
import { getCircuits, deleteCircuit, renameCircuit, exportCircuit } from '../utils/circuitStorage'

function LoadCircuitModal({ onLoad, onClose, showToast }) {
  const [circuits, setCircuits] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    loadCircuits()
  }, [])

  const loadCircuits = () => {
    setCircuits(getCircuits().reverse())
  }

  const handleDelete = (id) => {
    setConfirmDeleteId(id)
  }

  const confirmDelete = () => {
    deleteCircuit(confirmDeleteId)
    setConfirmDeleteId(null)
    loadCircuits()
  }

  const handleRename = (id) => {
    if (editingName.trim()) {
      renameCircuit(id, editingName)
      setEditingId(null)
      setEditingName('')
      loadCircuits()
    }
  }

  const startRename = (circuit) => {
    setEditingId(circuit.id)
    setEditingName(circuit.name)
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Load Circuit</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="saved-circuits-list">
          {circuits.length === 0 ? (
            <div className="circuit-empty" style={{ padding: '3rem' }}>
              No saved circuits yet
            </div>
          ) : (
            circuits.map(circuit => (
              <div key={circuit.id} className="saved-circuit-item">
                <div className="saved-circuit-info">
                  {editingId === circuit.id ? (
                    <input
                      type="text"
                      className="config-input"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleRename(circuit.id)}
                      onBlur={() => handleRename(circuit.id)}
                      autoFocus
                    />
                  ) : (
                    <div className="saved-circuit-name" onClick={() => startRename(circuit)}>
                      {circuit.name}
                    </div>
                  )}
                  <div className="saved-circuit-details">
                    {circuit.numQubits} qubit{circuit.numQubits > 1 ? 's' : ''} • {circuit.operations.length} operation{circuit.operations.length !== 1 ? 's' : ''} • {formatDate(circuit.timestamp)}
                  </div>
                  {confirmDeleteId === circuit.id && (
                    <div className="inline-confirm">
                      <span>Delete this circuit?</span>
                      <button className="btn btn-clear" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }} onClick={confirmDelete}>Yes, delete</button>
                      <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                    </div>
                  )}
                </div>
                <div className="saved-circuit-actions">
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => exportCircuit(circuit)}
                  >
                    Export
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => { onLoad(circuit); onClose() }}
                  >
                    Load
                  </button>
                  <button
                    className="btn btn-clear"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => handleDelete(circuit.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default LoadCircuitModal