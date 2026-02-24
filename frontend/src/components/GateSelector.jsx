import React, { useState } from 'react'

const GATES = ['X', 'Y', 'Z', 'H', 'CNOT', 'MEASURE']

function GateSelector({ numQubits, onNumQubitsChange, onAddOperation, onLoadPreset, initialState, onInitialStateChange }) {
  const [selectedGate, setSelectedGate] = useState(null)
  const [targetQubit, setTargetQubit] = useState(0)
  const [controlQubit, setControlQubit] = useState(0)

  const handleGateClick = (gate) => {
    setSelectedGate(gate)
  }

  const handleConfirm = () => {
    if (!selectedGate) return

    let operation
    if (selectedGate === 'CNOT') {
      if (controlQubit === targetQubit) {
        alert('Control and target qubits must be different!')
        return
      }
      operation = {
        gate: selectedGate.toLowerCase(),
        control: controlQubit,
        target: targetQubit
      }
    } else {
      operation = {
        gate: selectedGate.toLowerCase(),
        target: targetQubit
      }
    }

    onAddOperation(operation)
    setSelectedGate(null)
  }

  const getGateLabel = (gate) => {
    if (gate === 'MEASURE') return 'Measurement'
    return gate
  }

  const handleQubitStateChange = (qubitIndex, value) => {
    const newState = initialState.split('')
    newState[qubitIndex] = value
    onInitialStateChange(newState.join(''))
  }

  return (
    <>
      <div className="card">
        <h2 className="card-title">Configuration</h2>
        <div className="config-row">
          <label className="config-label">Number of Qubits:</label>
          <div className="qubit-counter">
            <button
              className="qubit-btn"
              onClick={() => numQubits > 1 && onNumQubitsChange(numQubits - 1)}
              disabled={numQubits <= 1}
            >−</button>
            <span className="qubit-value">{numQubits}</span>
            <button
              className="qubit-btn"
              onClick={() => numQubits < 3 && onNumQubitsChange(numQubits + 1)}
              disabled={numQubits >= 3}
            >+</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Initial State</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {[...Array(numQubits)].map((_, i) => (
            <div key={i} className="config-row">
              <label className="config-label">Qubit {i}:</label>
              <select 
                className="config-input"
                value={initialState[i] || '0'}
                onChange={(e) => handleQubitStateChange(i, e.target.value)}
              >
                <option value="0">|0⟩</option>
                <option value="1">|1⟩</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Quantum Gates</h2>
        <div className="gates-grid">
          {GATES.map(gate => (
            <button 
              key={gate}
              className={`gate-btn ${gate.toLowerCase()}`}
              onClick={() => handleGateClick(gate)}
            >
              {getGateLabel(gate)}
            </button>
          ))}
        </div>

        {selectedGate && (
          <div className="gate-config">
            <div className="input-group">
              <label className="input-label">Target Qubit</label>
              <select 
                className="input-select"
                value={targetQubit}
                onChange={(e) => setTargetQubit(parseInt(e.target.value))}
              >
                {[...Array(numQubits)].map((_, i) => (
                  <option key={i} value={i}>Qubit {i}</option>
                ))}
              </select>
            </div>

            {selectedGate === 'CNOT' && (
              <div className="input-group">
                <label className="input-label">Control Qubit</label>
                <select 
                  className="input-select"
                  value={controlQubit}
                  onChange={(e) => setControlQubit(parseInt(e.target.value))}
                >
                  {[...Array(numQubits)].map((_, i) => (
                    <option key={i} value={i}>Qubit {i}</option>
                  ))}
                </select>
              </div>
            )}

            <button className="btn btn-primary btn-block" onClick={handleConfirm}>
              Add to Circuit
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">Quick Start</h2>
        <div className="presets-grid">
          <button className="btn btn-secondary" onClick={() => onLoadPreset('bell')}>
            Bell State
          </button>
          <button className="btn btn-secondary" onClick={() => onLoadPreset('activity')}>
            Example
          </button>
        </div>
      </div>
    </>
  )
}

export default GateSelector