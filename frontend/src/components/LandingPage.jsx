import React from 'react'

function LandingPage({ onStart }) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-hero">
          <h1 className="landing-title">Quantum Circuit Simulator</h1>
          <p className="landing-subtitle">
            Professional quantum computing platform with advanced visualization and analysis tools
          </p>
        </div>

        <div className="landing-features">
          <FeatureCard 
            icon="⊕"
            title="Circuit Builder"
            description="Drag and drop quantum gates with undo/redo support. Build complex circuits with H, X, Y, Z, CNOT, and measurement operations."
          />
          <FeatureCard 
            icon="→"
            title="Step-by-Step Execution"
            description="Watch your quantum circuit execute one gate at a time. Visualize state evolution and understand how each operation affects the quantum state."
          />
          <FeatureCard 
            icon="◉"
            title="Bloch Sphere"
            description="Interactive 3D visualization of single-qubit states. Rotate and explore the Bloch sphere representation of your quantum state."
          />
          <FeatureCard 
            icon="∞"
            title="Entanglement Analysis"
            description="Comprehensive metrics including concurrence, entropy, and entanglement classification for 2-qubit systems."
          />
          <FeatureCard 
            icon="⟨ψ⟩"
            title="State Visualization"
            description="Real-time circuit diagrams, probability distributions, and mathematical notation in Dirac format."
          />
          <FeatureCard 
            icon="{ }"
            title="Code Export"
            description="Generate production-ready code in Python (NumPy) or Qiskit (IBM). Download or copy to clipboard instantly."
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