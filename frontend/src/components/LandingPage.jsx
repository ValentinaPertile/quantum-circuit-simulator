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
            icon="Q"
            title="Circuit Builder"
            description="Drag & drop quantum gates with Undo/Redo support. Build complex circuits with H, X, Y, Z, CNOT, and measurement operations."
          />
          <FeatureCard 
            icon="⚡"
            title="Step-by-Step Execution"
            description="Watch your quantum circuit execute one gate at a time. Visualize state evolution and understand how each operation affects the quantum state."
          />
          <FeatureCard 
            icon="🌐"
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
          <FeatureCard 
            icon="💾"
            title="Circuit Storage"
            description="Save circuits to browser storage, load previous work, and export/import JSON files. Never lose your progress."
          />
          <FeatureCard 
            icon="🎨"
            title="Professional UI"
            description="Beautiful beige and moss green theme with dark mode support. Clean, intuitive interface designed for researchers and students."
          />
        </div>

        <div className="landing-info">
          <p><strong>Features:</strong> Supports up to 3 qubits • Full state vector simulation • Initial state configuration • Preset circuits (Bell State, Example algorithms)</p>
        </div>

        <button className="btn-start" onClick={onStart}>
          Start Building Circuits
        </button>

        <div className="landing-tech-stack">
          <h3>Technology Stack</h3>
          <div className="tech-stack-grid">
            <div className="tech-item">
              <strong>Frontend:</strong> React with D3.js visualization
            </div>
            <div className="tech-item">
              <strong>Backend:</strong> Python with NumPy quantum simulation
            </div>
            <div className="tech-item">
              <strong>Storage:</strong> Browser LocalStorage with JSON export
            </div>
            <div className="tech-item">
              <strong>Export:</strong> Python, Qiskit, and JSON formats
            </div>
          </div>
        </div>
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