import React from 'react'

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '400px' }}
      >
        <div className="modal-header">
          <h2 className="modal-title">Confirm</h2>
        </div>

        <div className="modal-body">
          <p style={{ lineHeight: '1.6' }}>{message}</p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog