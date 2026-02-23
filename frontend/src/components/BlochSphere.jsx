import React, { useEffect, useRef, useState } from 'react'
import { simulateCircuit } from '../utils/api'
import * as THREE from 'three'

function BlochSphere({ operations, initialState }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const arrowRef = useRef(null)
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadState()
  }, [operations, initialState])

  useEffect(() => {
    if (containerRef.current && !sceneRef.current && !loading) {
      initBlochSphere()
    }
    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [loading])

  useEffect(() => {
    if (state && arrowRef.current) {
      updateStateVector()
    }
  }, [state])

  const loadState = async () => {
    setLoading(true)
    try {
      const result = await simulateCircuit(1, operations, initialState)
      if (result.success) {
        setState(result.amplitudes)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const initBlochSphere = () => {
    const container = containerRef.current

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f1e8)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, 800 / 600, 0.1, 1000)
    camera.position.set(4, 3, 5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(800, 600)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Wireframe sphere
    const sphereGeometry = new THREE.SphereGeometry(2, 32, 32)
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xc9bfa8,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)

    // Axes
    const createAxis = (color, from, to) => {
      const points = [from, to]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({ color, linewidth: 2 })
      return new THREE.Line(geometry, material)
    }

    scene.add(createAxis(0xff6b6b, new THREE.Vector3(-2.5, 0, 0), new THREE.Vector3(2.5, 0, 0)))
    scene.add(createAxis(0x6bff6b, new THREE.Vector3(0, -2.5, 0), new THREE.Vector3(0, 2.5, 0)))
    scene.add(createAxis(0x6b6bff, new THREE.Vector3(0, 0, -2.5), new THREE.Vector3(0, 0, 2.5)))

    // State vector arrow
    const arrowGroup = new THREE.Group()

    const coneGeometry = new THREE.ConeGeometry(0.15, 0.4, 16)
    const arrowMaterial = new THREE.MeshPhongMaterial({ color: 0x6b7f5f })
    const cone = new THREE.Mesh(coneGeometry, arrowMaterial)
    arrowGroup.add(cone)

    const cylinderGeometry = new THREE.CylinderGeometry(0.06, 0.06, 2, 16)
    const cylinder = new THREE.Mesh(cylinderGeometry, arrowMaterial)
    arrowGroup.add(cylinder)

    const spherePoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      arrowMaterial
    )
    arrowGroup.add(spherePoint)

    scene.add(arrowGroup)
    arrowRef.current = arrowGroup

    // Animation
    function animate() {
      requestAnimationFrame(animate)
      sphere.rotation.y += 0.003
      renderer.render(scene, camera)
    }
    animate()

    console.log('Bloch sphere initialized')
  }

  const updateStateVector = () => {
    if (!state || !arrowRef.current) return

    const alpha = state['0']
    const beta = state['1']

    const theta = 2 * Math.acos(Math.sqrt(alpha.probability))
    const phi = Math.atan2(beta.imag, beta.real)

    const x = Math.sin(theta) * Math.cos(phi)
    const y = Math.sin(theta) * Math.sin(phi)
    const z = Math.cos(theta)

    const length = 2
    const endPoint = new THREE.Vector3(x * length, y * length, z * length)

    const arrow = arrowRef.current
    arrow.position.set(0, 0, 0)

    const direction = endPoint.clone().normalize()
    const quaternion = new THREE.Quaternion()
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
    arrow.setRotationFromQuaternion(quaternion)

    arrow.children[0].position.y = length
    arrow.children[1].position.y = length / 2
    arrow.children[1].scale.y = length / 2
    arrow.children[2].position.copy(endPoint)

    console.log('State vector updated:', { x, y, z, theta, phi })
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
      <div className="bloch-content-3d">
        <div className="card bloch-card-3d">
          <h2 className="card-title">Bloch Sphere Visualization</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Interactive 3D representation of the quantum state
          </p>
          <div 
            ref={containerRef} 
            style={{ 
              width: '800px', 
              height: '600px', 
              border: '2px solid var(--beige-300)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          />
        </div>

        <div className="bloch-info">
          <div className="card">
            <h2 className="card-title">State Information</h2>
            {state && (
              <div className="state-info-grid">
                <div className="info-item">
                  <span className="info-label">|0⟩ amplitude:</span>
                  <span className="info-value">
                    {state['0'].real.toFixed(4)} + {state['0'].imag.toFixed(4)}i
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">|1⟩ amplitude:</span>
                  <span className="info-value">
                    {state['1'].real.toFixed(4)} + {state['1'].imag.toFixed(4)}i
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">|0⟩ probability:</span>
                  <span className="info-value">
                    {(state['0'].probability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">|1⟩ probability:</span>
                  <span className="info-value">
                    {(state['1'].probability * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">Visualization Guide</h2>
            <div className="controls-info">
              <div className="control-item">
                <strong>Red axis:</strong> X direction
              </div>
              <div className="control-item">
                <strong>Green axis:</strong> Y direction
              </div>
              <div className="control-item">
                <strong>Blue axis:</strong> Z direction (|0⟩ to |1⟩)
              </div>
              <div className="control-item">
                <strong>Green arrow:</strong> Current quantum state
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">About the Bloch Sphere</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              The Bloch sphere represents all possible pure states of a single qubit. 
              The north pole (positive Z) represents |0⟩ and the south pole represents |1⟩. 
              The green arrow points to the current state on the sphere surface.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlochSphere