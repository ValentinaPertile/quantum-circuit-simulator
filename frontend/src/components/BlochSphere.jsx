import React, { useEffect, useRef, useState } from 'react'
import { simulateCircuit } from '../utils/api'

function BlochSphere({ operations, initialState }) {
  const canvasRef = useRef(null)
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rotation, setRotation] = useState({ theta: Math.PI / 4, phi: Math.PI / 4 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    loadState()
  }, [operations, initialState])

  useEffect(() => {
    if (state) {
      drawBlochSphere()
    }
  }, [state, rotation])

  const loadState = async () => {
    setLoading(true)
    try {
      const result = await simulateCircuit(1, operations, initialState)
      if (result.success) {
        setState(result.amplitudes)
      }
    } catch (error) {
      console.error('Failed to load state:', error)
    } finally {
      setLoading(false)
    }
  }

  const drawBlochSphere = () => {
    const canvas = canvasRef.current
    if (!canvas || !state) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.35

    // Clear canvas
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--beige-100').trim()
    ctx.fillRect(0, 0, width, height)

    // Calculate Bloch vector from state
    const alpha = state['0']
    const beta = state['1']
    
    const theta = 2 * Math.acos(Math.sqrt(alpha.probability))
    const phi = Math.atan2(beta.imag, beta.real)

    // Draw sphere
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--beige-300').trim()
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.stroke()

    // Draw equator
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, radius, radius * 0.3, 0, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw axes
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim()
    ctx.lineWidth = 1
    
    // X axis
    ctx.beginPath()
    ctx.moveTo(centerX - radius - 20, centerY)
    ctx.lineTo(centerX + radius + 20, centerY)
    ctx.stroke()
    
    // Y axis  
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - radius - 20)
    ctx.lineTo(centerX, centerY + radius + 20)
    ctx.stroke()

    // Z axis (coming out)
    ctx.beginPath()
    ctx.moveTo(centerX - radius * 0.7, centerY + radius * 0.7)
    ctx.lineTo(centerX + radius * 0.7, centerY - radius * 0.7)
    ctx.stroke()

    // Draw labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
    ctx.font = '16px Georgia'
    ctx.fillText('X', centerX + radius + 30, centerY + 5)
    ctx.fillText('Y', centerX - 5, centerY - radius - 25)
    ctx.fillText('Z', centerX + radius * 0.7 + 10, centerY - radius * 0.7 - 10)

    // Draw state vector with rotation
    const x = radius * Math.sin(theta) * Math.cos(phi + rotation.phi)
    const y = radius * Math.sin(theta) * Math.sin(phi + rotation.phi)
    const z = radius * Math.cos(theta)

    // Apply 3D rotation
    const rotX = x
    const rotY = y * Math.cos(rotation.theta) - z * Math.sin(rotation.theta)
    const rotZ = y * Math.sin(rotation.theta) + z * Math.cos(rotation.theta)

    // Project to 2D
    const screenX = centerX + rotX
    const screenY = centerY - rotY

    // Draw vector arrow
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--moss-green').trim()
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--moss-green').trim()
    ctx.lineWidth = 3
    
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(screenX, screenY)
    ctx.stroke()

    // Draw arrowhead
    const angle = Math.atan2(screenY - centerY, screenX - centerX)
    const arrowSize = 15
    ctx.beginPath()
    ctx.moveTo(screenX, screenY)
    ctx.lineTo(
      screenX - arrowSize * Math.cos(angle - Math.PI / 6),
      screenY - arrowSize * Math.sin(angle - Math.PI / 6)
    )
    ctx.lineTo(
      screenX - arrowSize * Math.cos(angle + Math.PI / 6),
      screenY - arrowSize * Math.sin(angle + Math.PI / 6)
    )
    ctx.closePath()
    ctx.fill()

    // Draw state point
    ctx.beginPath()
    ctx.arc(screenX, screenY, 8, 0, 2 * Math.PI)
    ctx.fill()

    // Draw pole labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--moss-green-dark').trim()
    ctx.font = 'bold 18px Georgia'
    ctx.fillText('|0', centerX - 15, centerY - radius - 30)
    ctx.fillText('|1', centerX - 15, centerY + radius + 45)
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setLastMouse({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastMouse.x
    const deltaY = e.clientY - lastMouse.y

    setRotation(prev => ({
      theta: prev.theta + deltaY * 0.01,
      phi: prev.phi + deltaX * 0.01
    }))

    setLastMouse({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  if (loading) {
    return (
      <div className="bloch-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading Bloch sphere...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bloch-container">
      <div className="bloch-content">
        <div className="card bloch-card">
          <h2 className="card-title">Bloch Sphere Visualization</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Drag to rotate the sphere
          </p>
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="bloch-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        <div className="bloch-info">
          <div className="card">
            <h2 className="card-title">State Information</h2>
            {state && (
              <div className="state-info-grid">
                <div className="info-item">
                  <span className="info-label">|0 amplitude:</span>
                  <span className="info-value">
                    {state['0'].real.toFixed(4)} + {state['0'].imag.toFixed(4)}i
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">|1 amplitude:</span>
                  <span className="info-value">
                    {state['1'].real.toFixed(4)} + {state['1'].imag.toFixed(4)}i
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">|0 probability:</span>
                  <span className="info-value">
                    {(state['0'].probability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">|1 probability:</span>
                  <span className="info-value">
                    {(state['1'].probability * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">About the Bloch Sphere</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              The Bloch sphere is a geometric representation of the pure state space of a single qubit. 
              The north pole represents |0 and the south pole represents |1. 
              Any point on the surface represents a valid quantum state.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlochSphere