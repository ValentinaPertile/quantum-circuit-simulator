import React, { useState } from 'react'

const GATES = ['H', 'X', 'Y', 'Z', 'CNOT', 'MEASURE']

function GateSelector({ numQubits, onNumQubitsChange, onAddOperation, onLoadPreset }) {
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

  return (
    <>
      <div className="card">
        <h2 className="card-title">Configuration</h2>
        <div className="config-row">
          <label className="config-label">Number of Qubits:</label>
          <input 
            type="number" 
            className="config-input"
            min="1" 
            max="3" 
            value={numQubits}
            onChange={(e) => onNumQubitsChange(parseInt(e.target.value))}
          />
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
              {gate === 'MEASURE' ? 'M' : gate}
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
            Activity 5.4.3
          </button>
        </div>
      </div>
    </>
  )
}

export default GateSelector