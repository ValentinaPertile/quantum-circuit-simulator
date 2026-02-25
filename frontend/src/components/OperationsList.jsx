import React, { useState } from 'react'
import { simulateCircuit } from '../utils/api'

function OperationsList({ operations, onRemove, onReorder, onClear, onSimulate, numQubits, initialState, showToast }) {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSimulate = async () => {
    if (operations.length === 0) {
      showToast('Add some gates first!', 'error')
      return
    }
    setIsSimulating(true)
    try {
      const data = await simulateCircuit(numQubits, operations, initialState)
      onSimulate(data)
    } catch (error) {
      showToast('Could not connect to the backend. Make sure the Python server is running.', 'error')
      console.error(error)
    } finally {
      setIsSimulating(false)
    }
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    onReorder(draggedIndex, index)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="card">
      <div className="operations-header">
        <h2 className="card-title" style={{ marginBottom: 0 }}>Operations</h2>
        <button className="btn btn-clear" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="operations-list">
        {operations.length === 0 ? (
          <div className="circuit-empty">No operations yet</div>
        ) : (
          operations.map((op, idx) => (
            <OperationItem 
              key={idx}
              operation={op}
              index={idx}
              onRemove={onRemove}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              isDragging={draggedIndex === idx}
            />
          ))
        )}
      </div>
      <button 
        className="btn btn-primary btn-block" 
        onClick={handleSimulate}
        disabled={isSimulating}
      >
        {isSimulating ? 'Simulating...' : 'Run Simulation'}
      </button>
    </div>
  )
}

function OperationItem({ operation, index, onRemove, onDragStart, onDragOver, onDragEnd, isDragging }) {
  const { gate, target, control } = operation
  
  let displayName = ''
  let details = ''
  
  if (gate === 'cnot') {
    displayName = 'CNOT'
    details = `CNOT gate: control q${control} to target q${target}`
  } else if (gate === 'measure') {
    displayName = 'M'
    details = `Measurement on qubit ${target}`
  } else if (gate === 'h') {
    displayName = 'H'
    details = `Hadamard gate on qubit ${target}`
  } else if (gate === 'x') {
    displayName = 'X'
    details = `Pauli-X gate on qubit ${target}`
  } else if (gate === 'y') {
    displayName = 'Y'
    details = `Pauli-Y gate on qubit ${target}`
  } else if (gate === 'z') {
    displayName = 'Z'
    details = `Pauli-Z gate on qubit ${target}`
  } else {
    displayName = gate.toUpperCase()
    details = `qubit ${target}`
  }

  return (
    <div 
      className={`operation-item ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
    >
      <div className="drag-handle">⋮⋮</div>
      <div className="operation-info">
        <span className="operation-badge">
          {displayName}
        </span>
        <span className="operation-details">{details}</span>
      </div>
      <button className="operation-remove" onClick={() => onRemove(index)}>
        ×
      </button>
    </div>
  )
}

export default OperationsList