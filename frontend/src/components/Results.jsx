import React from 'react'

function Results({ results, numQubits, operations, initialState }) {
  if (!results || !results.success) {
    return (
      <>
        <div className="card">
          <h2 className="card-title">Circuit Notation</h2>
          <div className="circuit-empty">Run simulation to see circuit notation</div>
        </div>
        <div className="card">
          <h2 className="card-title">Quantum State</h2>
          <div className="circuit-empty">Run simulation to see results</div>
        </div>
        <div className="card">
          <h2 className="card-title">Entanglement</h2>
          <div className="circuit-empty">Available for 2-qubit systems</div>
        </div>
      </>
    )
  }

  const { amplitudes, entanglement } = results

  return (
    <>
      <div className="card">
        <h2 className="card-title">Circuit Notation</h2>
        <CircuitNotation 
          operations={operations} 
          initialState={initialState || '0'.repeat(numQubits)}
          finalAmplitudes={amplitudes}
        />
      </div>

      <div className="card">
        <h2 className="card-title">Quantum State</h2>
        <div>
          {Object.entries(amplitudes).map(([state, amp]) => (
            <AmplitudeBar key={state} state={state} probability={amp.probability} />
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Entanglement</h2>
        {entanglement && numQubits === 2 ? (
          <EntanglementInfo data={entanglement} />
        ) : (
          <div className="circuit-empty">Available for 2-qubit systems</div>
        )}
      </div>
    </>
  )
}

function CircuitNotation({ operations, initialState, finalAmplitudes }) {
  // Construir la notación del circuito
  const gateNotations = operations.map(op => {
    if (op.gate === 'cnot') {
      return `CNOT_{${op.control},${op.target}}`
    } else if (op.gate === 'measure') {
      return `M_{${op.target}}`
    } else {
      return `${op.gate.toUpperCase()}_{${op.target}}`
    }
  })

  // Estado final en notación compacta
  const finalState = Object.entries(finalAmplitudes)
    .filter(([_, amp]) => Math.abs(amp.real) > 0.001 || Math.abs(amp.imag) > 0.001)
    .map(([state, amp]) => {
      const magnitude = Math.sqrt(amp.real * amp.real + amp.imag * amp.imag)
      const coef = magnitude.toFixed(4)
      return `${coef}|${state}⟩`
    })
    .join(' + ')

  return (
    <div className="circuit-notation-container">
      <div className="circuit-flow">
        <span className="initial-state">|{initialState}⟩</span>
        <span className="arrow">→</span>
        {gateNotations.map((gate, idx) => (
          <React.Fragment key={idx}>
            <span className="gate-notation">{gate}</span>
            <span className="arrow">→</span>
          </React.Fragment>
        ))}
        <span className="final-state">|ψ⟩</span>
      </div>
      
      <div className="circuit-expansion">
        <div className="expansion-label">Where:</div>
        <div className="expansion-content">
          |ψ⟩ = {finalState || '0'}
        </div>
      </div>

      <button 
        className="btn btn-secondary" 
        style={{ marginTop: '1rem', width: '100%', fontSize: '0.85rem' }}
        onClick={() => {
          const flow = document.querySelector('.circuit-flow').textContent
          const expansion = document.querySelector('.expansion-content').textContent
          const text = `${flow}\n${expansion}`
          navigator.clipboard.writeText(text)
          alert('Circuit notation copied to clipboard!')
        }}
      >
        Copy Circuit Notation
      </button>
    </div>
  )
}

function AmplitudeBar({ state, probability }) {
  const percentage = (probability * 100).toFixed(1)

  return (
    <div className="amplitude-item">
      <div className="amplitude-header">
        <span className="amplitude-state">|{state}⟩</span>
        <span className="amplitude-probability">{percentage}%</span>
      </div>
      <div className="amplitude-bar-container">
        <div className="amplitude-bar" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  )
}

function EntanglementInfo({ data }) {
  if (!data || typeof data !== 'object') {
    return <div className="circuit-empty">Error loading entanglement data</div>
  }

  const is_entangled = data.is_entangled ?? false
  const classification = data.classification ?? 'unknown'
  const concurrence = data.concurrence ?? 0
  const entropy = data.entropy ?? 0

  return (
    <>
      <div className={`entanglement-status ${is_entangled ? 'entangled' : 'not-entangled'}`}>
        {is_entangled ? 'ENTANGLED' : 'NOT ENTANGLED'}
      </div>
      <div className="entanglement-metrics">
        <MetricRow label="Classification" value={classification} />
        <MetricRow label="Concurrence" value={concurrence.toFixed(4)} />
        <MetricRow label="Entropy" value={entropy.toFixed(4)} />
      </div>
    </>
  )
}

function MetricRow({ label, value }) {
  return (
    <div className="metric-row">
      <span className="metric-label">{label}:</span>
      <span className="metric-value">{value}</span>
    </div>
  )
}

export default Results
