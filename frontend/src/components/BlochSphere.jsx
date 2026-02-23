import React, { useState, useEffect, useRef } from 'react'
import { simulateCircuit } from '../utils/api'
import * as THREE from 'three'

function BlochSphere({ operations, initialState }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadState()
  }, [operations, initialState])

  useEffect(() => {
    if (containerRef.current && !sceneRef.current) {
      initThreeJS()
    }
    return () => {
      if (rendererRef.current) {
        containerRef.current?.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (state && sceneRef.current) {
      updateBlochVector()
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
      console.error('Error loading state:', error)
    } finally {
      setLoading(false)
    }
  }

    const initThreeJS = () => {
    const container = containerRef.current
    if (!container) return
    
    const width = container.clientWidth || 800
    const height = container.clientHeight || 600
    
    console.log('Container dimensions:', width, height)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f5f1e8')
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(4, 4, 6)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    const sphereGeometry = new THREE.SphereGeometry(2, 32, 32)
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xddd5c3,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)

    const axisLength = 2.5
    const xAxis = createAxis(0xff6b6b, axisLength, 0, 0)
    const yAxis = createAxis(0x6bff6b, 0, axisLength, 0)
    const zAxis = createAxis(0x6b6bff, 0, 0, axisLength)
    scene.add(xAxis, yAxis, zAxis)

    const arrowGroup = new THREE.Group()
    const arrowGeometry = new THREE.ConeGeometry(0.15, 0.4, 16)
    const arrowMaterial = new THREE.MeshPhongMaterial({ color: 0x6b7f5f })
    const arrowHead = new THREE.Mesh(arrowGeometry, arrowMaterial)
    arrowHead.rotation.x = Math.PI / 2
    arrowGroup.add(arrowHead)

    const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 16)
    const shaft = new THREE.Mesh(shaftGeometry, arrowMaterial)
    shaft.rotation.x = Math.PI / 2
    arrowGroup.add(shaft)

    scene.add(arrowGroup)
    scene.userData.arrow = arrowGroup

    animate()
  }

  const createAxis = (color, x, y, z) => {
    const material = new THREE.LineBasicMaterial({ color })
    const points = [
      new THREE.Vector3(-x, -y, -z),
      new THREE.Vector3(x, y, z)
    ]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return new THREE.Line(geometry, material)
  }

  const updateBlochVector = () => {
    if (!state || !sceneRef.current) return

    const alpha = state['0']
    const beta = state['1']
    const theta = 2 * Math.acos(Math.sqrt(alpha.probability))
    const phi = Math.atan2(beta.imag, beta.real)

    const x = 2 * Math.sin(theta) * Math.cos(phi)
    const y = 2 * Math.sin(theta) * Math.sin(phi)
    const z = 2 * Math.cos(theta)

    const arrow = sceneRef.current.userData.arrow
    if (arrow) {
      arrow.position.set(0, 0, 0)
      const direction = new THREE.Vector3(x, y, z).normalize()
      const quaternion = new THREE.Quaternion()
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction)
      arrow.setRotationFromQuaternion(quaternion)
      
      const length = Math.sqrt(x * x + y * y + z * z)
      arrow.children[1].scale.z = length
      arrow.children[0].position.z = length
    }
  }

  const animate = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return
    
    if (sceneRef.current.children[2]) {
      sceneRef.current.children[2].rotation.y += 0.005
    }
    
    rendererRef.current.render(sceneRef.current, cameraRef.current)
    requestAnimationFrame(animate)
  }

  console.log('Three.js initialized successfully')

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
            Interactive 3D quantum state representation
          </p>
          <div ref={containerRef} className="bloch-canvas-3d" />
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
            <h2 className="card-title">About the Bloch Sphere</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              The Bloch sphere represents the pure state space of a single qubit. 
              The north pole represents |0⟩ and the south pole represents |1⟩. 
              The green arrow shows the current quantum state.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlochSphere