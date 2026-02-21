import React, { useState } from 'react'

function SaveCircuitModal({ onSave, onClose }) {
  const [circuitName, setCircuitName] = useState('')

  const handleSave = () => {
    if (!circuitName.trim()) {
      alert('Please enter a circuit name')
      return
    }
    onSave(circuitName)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content save-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Save Circuit</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '1.5rem',
            lineHeight: '1.6'
          }}>
            Give your quantum circuit a name to save it to your local browser storage.
          </p>
          <div className="input-group">
            <label className="input-label">Circuit Name</label>
            <input
              type="text"
              className="config-input"
              style={{ width: '100%' }}
              placeholder="e.g., Bell State, Quantum Teleportation"
              value={circuitName}
              onChange={(e) => setCircuitName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            💾 Save Circuit
          </button>
        </div>
      </div>
    </div>
  )
}

export default SaveCircuitModal