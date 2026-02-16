import React from 'react'

function LandingPage({ onStart }) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-hero">
          <h1 className="landing-title">Quantum Circuit Simulator</h1>
          <p className="landing-subtitle">
            Interactive quantum computing platform for learning and experimentation
          </p>
        </div>

        <div className="landing-features">
          <FeatureCard 
            icon="Q"
            title="Quantum Gates"
            description="Build circuits with H, X, Y, Z, CNOT, and measurement operations"
          />
          <FeatureCard 
            icon="∞"
            title="Entanglement Analysis"
            description="Analyze quantum entanglement with concurrence and entropy metrics"
          />
          <FeatureCard 
            icon="⟨ψ⟩"
            title="State Visualization"
            description="Real-time circuit diagrams and probability distributions"
          />
          <FeatureCard 
            icon="{ }"
            title="Code Export"
            description="Export to Python, Qiskit, or Cirq formats"
          />
        </div>

        <div className="landing-info">
          <p><strong>Capabilities:</strong> Supports up to 3 qubits with full state vector simulation</p>
        </div>

        <button className="btn-start" onClick={onStart}>
          Start Building Circuits
        </button>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

export default LandingPage