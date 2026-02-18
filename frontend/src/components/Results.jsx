import React from 'react'

function Results({ results, numQubits }) {
  if (!results || !results.success) {
    return (
      <>
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
  const { is_entangled, classification, concurrence, entropy } = data

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
      <span class="metric-label">{label}:</span>
      <span className="metric-value">{value}</span>
    </div>
  )
}

export default Results