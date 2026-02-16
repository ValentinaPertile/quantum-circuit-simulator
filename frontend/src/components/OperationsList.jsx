import React from 'react'
import { simulateCircuit } from '../utils/api'

function OperationsList({ operations, onRemove, onClear, onSimulate, numQubits }) {
  const handleSimulate = async () => {
    if (operations.length === 0) {
      alert('Add some gates first!')
      return
    }

    try {
      const data = await simulateCircuit(numQubits, operations)
      onSimulate(data)
    } catch (error) {
      alert('Failed to connect to backend. Make sure the Python server is running.')
      console.error(error)
    }
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
            />
          ))
        )}
      </div>
      <button className="btn btn-primary btn-block" onClick={handleSimulate}>
        Run Simulation
      </button>
    </div>
  )
}

function OperationItem({ operation, index, onRemove }) {
  const { gate, target, control } = operation
  const gateName = gate.toUpperCase()

  let details = ''
  if (gate === 'cnot') {
    details = `control: q${control} → target: q${target}`
  } else if (gate === 'measure') {
    details = `measure qubit ${target}`
  } else {
    details = `qubit ${target}`
  }

  return (
    <div className="operation-item">
      <div className="operation-info">
        <span className="operation-badge">
          {gate === 'measure' ? 'M' : gateName}
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