import React, { useEffect, useRef, useState } from 'react'
import { simulateCircuit } from '../utils/api'
import * as THREE from 'three'
import { OrbitControls } from 'three-stdlib'

function BlochSphere({ operations, initialState }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const controlsRef = useRef(null)
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
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
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

  useEffect(() => {
  // Update scene background when theme changes
  const updateTheme = () => {
    if (sceneRef.current) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      const bgColor = isDark ? 0x252520 : 0xf5f1e8
      sceneRef.current.background = new THREE.Color(bgColor)
    }
  }

  const observer = new MutationObserver(updateTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })

  return () => observer.disconnect()
}, [])

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

    // OrbitControls for rotation
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.enablePan = false
    controls.minDistance = 3
    controls.maxDistance = 10
    controlsRef.current = controls

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
      opacity: 0.3
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)

    // Solid sphere (semi-transparent)
    const solidSphereMaterial = new THREE.MeshPhongMaterial({
      color: 0xebe4d6,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    })
    const solidSphere = new THREE.Mesh(sphereGeometry, solidSphereMaterial)
    scene.add(solidSphere)

    // Axes with labels
    const createAxisWithLabel = (color, from, to, label, labelPos) => {
      const points = [from, to]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({ color, linewidth: 3 })
      const line = new THREE.Line(geometry, material)
      scene.add(line)

      // Create text sprite
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 128
      canvas.height = 128
      context.font = 'Bold 80px Georgia'
      context.fillStyle = `#${color.toString(16).padStart(6, '0')}`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(label, 64, 64)

      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.position.copy(labelPos)
      sprite.scale.set(0.4, 0.4, 1)
      scene.add(sprite)
    }

    const axisColor = 0x8a8a8a // Gray color
    createAxisWithLabel(axisColor, new THREE.Vector3(-2, 0, 0), new THREE.Vector3(2, 0, 0), 'X', new THREE.Vector3(2.3, 0, 0))
    createAxisWithLabel(axisColor, new THREE.Vector3(0, -2, 0), new THREE.Vector3(0, 2, 0), 'Y', new THREE.Vector3(0, 2.3, 0))
    createAxisWithLabel(axisColor, new THREE.Vector3(0, 0, -2), new THREE.Vector3(0, 0, 2), 'Z', new THREE.Vector3(0, 0, 2.3))
   
  // |0⟩ and |1⟩ labels
    const createStateLabel = (text, position, color) => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 256
      canvas.height = 256
      context.font = 'Bold 100px Georgia'
      context.fillStyle = '#8a8a8a' // Gray color for labels
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(text, 128, 128)

      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.position.copy(position)
      sprite.scale.set(0.6, 0.6, 1)
      scene.add(sprite)
    }

    createStateLabel('|0⟩', new THREE.Vector3(0, 0, 2.5), '#6b7f5f')
    createStateLabel('|1⟩', new THREE.Vector3(0, 0, -2.5), '#6b7f5f')

    // Equator circle
    const equatorPoints = []
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2
      equatorPoints.push(new THREE.Vector3(
        2 * Math.cos(angle),
        2 * Math.sin(angle),
        0
      ))
    }
    const equatorGeometry = new THREE.BufferGeometry().setFromPoints(equatorPoints)
    const equator = new THREE.Line(
      equatorGeometry,
      new THREE.LineBasicMaterial({ color: 0xc9bfa8, transparent: true, opacity: 0.4 })
    )
    scene.add(equator)

    // State vector arrow
    const arrowGroup = new THREE.Group()

    const coneGeometry = new THREE.ConeGeometry(0.15, 0.4, 16)
    const arrowMaterial = new THREE.MeshPhongMaterial({ color: 0x8a9d7d }) // Lighter moss green
    const cone = new THREE.Mesh(coneGeometry, arrowMaterial)
    arrowGroup.add(cone)

    const cylinderGeometry = new THREE.CylinderGeometry(0.06, 0.06, 2, 16)
    const cylinder = new THREE.Mesh(cylinderGeometry, arrowMaterial)
    arrowGroup.add(cylinder)

    scene.add(arrowGroup)
    arrowRef.current = arrowGroup

    // Animation
    function animate() {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    console.log('Bloch sphere with OrbitControls initialized')
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
          <div 
            ref={containerRef} 
            style={{ 
              width: '800px', 
              height: '600px', 
              border: '2px solid var(--beige-300)',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'grab'
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
            <h2 className="card-title">About the Bloch Sphere</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              The Bloch sphere represents all possible pure states of a single qubit. 
              The north pole (positive Z) represents |0⟩ and the south pole represents |1⟩. 
              The green arrow points to the current quantum state.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlochSphere