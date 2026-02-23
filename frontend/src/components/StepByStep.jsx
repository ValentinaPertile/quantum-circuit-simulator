import React, { useState, useEffect } from 'react'
import { simulateCircuit } from '../utils/api'
import CircuitVisualizer from './CircuitVisualizer'

function StepByStep({ operations, numQubits, initialState }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepResults, setStepResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadSteps()
  }, [operations, numQubits, initialState])

  const loadSteps = async () => {
    if (operations.length === 0) {
      setStepResults([])
      setCurrentStep(0)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const steps = []
      
      // Initial state
      const initialResult = await simulateCircuit(numQubits, [], initialState)
      steps.push({
        stepNumber: 0,
        operation: null,
        result: initialResult
      })

      // Simulate each step
      for (let i = 0; i < operations.length; i++) {
        const opsUpToNow = operations.slice(0, i + 1)
        const result = await simulateCircuit(numQubits, opsUpToNow, initialState)
        steps.push({
          stepNumber: i + 1,
          operation: operations[i],
          result: result
        })
      }

      setStepResults(steps)
      setCurrentStep(0)
    } catch (err) {
      setError('Failed to simulate steps. Make sure the backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const goToStep = (step) => {
    setCurrentStep(Math.max(0, Math.min(step, stepResults.length - 1)))
  }

  const nextStep = () => goToStep(currentStep + 1)
  const prevStep = () => goToStep(currentStep - 1)
  const goToFirst = () => goToStep(0)
  const goToLast = () => goToStep(stepResults.length - 1)

  if (operations.length === 0) {
    return (
      <div className="step-by-step-container">
        <div className="empty-state">
          <div className="empty-icon">Circuit</div>
          <h3>No Operations</h3>
          <p>Add some gates to the circuit to see step-by-step execution</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="step-by-step-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Simulating circuit steps...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="step-by-step-container">
        <div className="error-state">
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadSteps}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (stepResults.length === 0) {
    return (
      <div className="step-by-step-container">
        <div className="empty-state">
          <h3>Loading...</h3>
        </div>
      </div>
    )
  }

  const currentStepData = stepResults[currentStep]

  if (!currentStepData) {
    return (
      <div className="step-by-step-container">
        <div className="error-state">
          <h3>Error</h3>
          <p>Step data not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="step-by-step-container">
      <div className="step-controls">
        <button 
          className="btn btn-secondary"
          onClick={goToFirst}
          disabled={currentStep === 0}
        >
          First
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </button>
        
        <div className="step-indicator">
          Step {currentStep} of {stepResults.length - 1}
        </div>
        
        <button 
          className="btn btn-secondary"
          onClick={nextStep}
          disabled={currentStep === stepResults.length - 1}
        >
          Next
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={goToLast}
          disabled={currentStep === stepResults.length - 1}
        >
          Last
        </button>
      </div>

      <div className="step-content">
        <div className="step-left">
          <div className="card">
            <h2 className="card-title">Circuit Progress</h2>
            <CircuitVisualizer 
              numQubits={numQubits}
              operations={operations.slice(0, currentStep)}
            />
          </div>

          <div className="card">
            <h2 className="card-title">Current Operation</h2>
            {currentStepData.operation ? (
              <div className="current-operation">
                <div className="operation-display">
                  <span className="operation-badge-large">
                    {currentStepData.operation.gate.toUpperCase()}
                  </span>
                  <div className="operation-description">
                    {getOperationDescription(currentStepData.operation)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="circuit-empty">Initial state</div>
            )}
          </div>
        </div>

        <div className="step-right">
          <div className="card">
            <h2 className="card-title">Quantum State</h2>
            {currentStepData.result && currentStepData.result.success && (
              <div>
                {Object.entries(currentStepData.result.amplitudes).map(([state, amp]) => (
                  <AmplitudeBar key={state} state={state} probability={amp.probability} />
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">State Vector Notation</h2>
            {currentStepData.result && currentStepData.result.success && (
              <StateNotation amplitudes={currentStepData.result.amplitudes} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getOperationDescription(op) {
  if (op.gate === 'cnot') {
    return `CNOT gate: control qubit ${op.control}, target qubit ${op.target}`
  } else if (op.gate === 'measure') {
    return `Measurement on qubit ${op.target}`
  } else if (op.gate === 'h') {
    return `Hadamard gate on qubit ${op.target}`
  } else if (op.gate === 'x') {
    return `Pauli-X gate on qubit ${op.target}`
  } else if (op.gate === 'y') {
    return `Pauli-Y gate on qubit ${op.target}`
  } else if (op.gate === 'z') {
    return `Pauli-Z gate on qubit ${op.target}`
  }
  return `${op.gate.toUpperCase()} gate on qubit ${op.target}`
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

function StateNotation({ amplitudes }) {
  const terms = Object.entries(amplitudes)
    .filter(([_, amp]) => Math.abs(amp.real) > 0.001 || Math.abs(amp.imag) > 0.001)
    .map(([state, amp]) => {
      const magnitude = Math.sqrt(amp.real * amp.real + amp.imag * amp.imag)
      const coef = magnitude.toFixed(4)
      return { coef, state }
    })

  if (terms.length === 0) {
    return <div className="state-notation">|ψ⟩ = 0</div>
  }

  return (
    <div className="state-notation">
      <span className="psi">|ψ⟩ = </span>
      {terms.map((term, idx) => (
        <span key={idx}>
          {idx > 0 && <span className="operator"> + </span>}
          <span className="coefficient">{term.coef}</span>
          <span className="ket">|{term.state}⟩</span>
        </span>
      ))}
    </div>
  )
}

export default StepByStep