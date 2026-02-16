import React, { useEffect, useRef } from 'react'
import { drawCircuit } from '../utils/circuitDrawer'

function CircuitVisualizer({ numQubits, operations }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (svgRef.current) {
      drawCircuit(svgRef.current, numQubits, operations)
    }
  }, [numQubits, operations])

  return (
    <div className="card">
      <h2 className="card-title">Circuit Diagram</h2>
      <div className="circuit-display">
        {operations.length === 0 ? (
          <div className="circuit-empty">Add gates to visualize the circuit</div>
        ) : (
          <svg ref={svgRef} width="100%" height="350"></svg>
        )}
      </div>
    </div>
  )
}

export default CircuitVisualizer