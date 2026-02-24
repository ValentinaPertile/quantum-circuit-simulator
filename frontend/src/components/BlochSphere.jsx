import React, { useEffect, useRef, useState } from 'react'
import { simulateCircuit } from '../utils/api'
import * as THREE from 'three'
import { OrbitControls } from 'three-stdlib'

function BlochSphere({ operations, initialState }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const arrowRef = useRef(null)
  const animFrameRef = useRef(null)
  const observerRef = useRef(null)
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadState()
  }, [operations, initialState])

  useEffect(() => {
    if (loading) return
    if (!containerRef.current) return

    // Wait one animation frame so the DOM has finished layout
    const raf = requestAnimationFrame(() => {
      initBlochSphere()
    })

    return () => {
      cancelAnimationFrame(raf)
      cleanup()
    }
  }, [loading])

  useEffect(() => {
    if (state && arrowRef.current) {
      updateStateVector()
    }
  }, [state])

  useEffect(() => {
    const updateTheme = () => {
      if (sceneRef.current) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
        sceneRef.current.background = new THREE.Color(isDark ? 0x252520 : 0xf5f1e8)
      }
    }
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const cleanup = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (observerRef.current) observerRef.current.disconnect()
    if (controlsRef.current) controlsRef.current.dispose()
    if (rendererRef.current) {
      if (containerRef.current && rendererRef.current.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
      rendererRef.current.dispose()
    }
    sceneRef.current = null
    rendererRef.current = null
    cameraRef.current = null
    controlsRef.current = null
    arrowRef.current = null
  }

  const loadState = async () => {
    setLoading(true)
    try {
      const result = await simulateCircuit(1, operations, initialState)
      if (result.success) setState(result.amplitudes)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const initBlochSphere = () => {
    const container = containerRef.current
    if (!container) return

    const w = container.clientWidth
    const h = container.clientHeight
    if (w === 0 || h === 0) return

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(isDark ? 0x252520 : 0xf5f1e8)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000)
    camera.position.set(4, 3, 5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // false = don't override canvas CSS size
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // ResizeObserver updates camera + renderer on any size change
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width === 0 || height === 0) continue
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
      }
    })
    resizeObserver.observe(container)
    observerRef.current = resizeObserver

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.enablePan = false
    controls.minDistance = 3
    controls.maxDistance = 10
    controlsRef.current = controls

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
    dirLight.position.set(5, 5, 5)
    scene.add(dirLight)

    const sphereGeo = new THREE.SphereGeometry(2, 32, 32)
    scene.add(new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({
      color: 0xc9bfa8, wireframe: true, transparent: true, opacity: 0.3
    })))
    scene.add(new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({
      color: 0xebe4d6, transparent: true, opacity: 0.15, side: THREE.DoubleSide
    })))

    const addAxis = (from, to, label, labelPos) => {
      const geo = new THREE.BufferGeometry().setFromPoints([from, to])
      scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x8a8a8a })))
      const canvas = document.createElement('canvas')
      canvas.width = 128; canvas.height = 128
      const ctx = canvas.getContext('2d')
      ctx.font = 'Bold 80px Georgia'
      ctx.fillStyle = '#8a8a8a'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, 64, 64)
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }))
      sprite.position.copy(labelPos)
      sprite.scale.set(0.4, 0.4, 1)
      scene.add(sprite)
    }
    addAxis(new THREE.Vector3(-2,0,0), new THREE.Vector3(2,0,0), 'X', new THREE.Vector3(2.3,0,0))
    addAxis(new THREE.Vector3(0,-2,0), new THREE.Vector3(0,2,0), 'Y', new THREE.Vector3(0,2.3,0))
    addAxis(new THREE.Vector3(0,0,-2), new THREE.Vector3(0,0,2), 'Z', new THREE.Vector3(0,0,2.3))

    const addLabel = (text, pos) => {
      const canvas = document.createElement('canvas')
      canvas.width = 256; canvas.height = 256
      const ctx = canvas.getContext('2d')
      ctx.font = 'Bold 100px Georgia'
      ctx.fillStyle = '#8a8a8a'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 128, 128)
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }))
      sprite.position.copy(pos)
      sprite.scale.set(0.6, 0.6, 1)
      scene.add(sprite)
    }
    addLabel('|0⟩', new THREE.Vector3(0, 0, 2.5))
    addLabel('|1⟩', new THREE.Vector3(0, 0, -2.5))

    const eqPts = []
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2
      eqPts.push(new THREE.Vector3(2 * Math.cos(a), 2 * Math.sin(a), 0))
    }
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(eqPts),
      new THREE.LineBasicMaterial({ color: 0xc9bfa8, transparent: true, opacity: 0.4 })
    ))

    const arrowGroup = new THREE.Group()
    const mat = new THREE.MeshPhongMaterial({ color: 0x8a9d7d })
    arrowGroup.add(new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 16), mat))
    arrowGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2, 16), mat))
    scene.add(arrowGroup)
    arrowRef.current = arrowGroup

    if (state) updateStateVector()

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()
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
    const direction = new THREE.Vector3(x * length, y * length, z * length).normalize()
    const quaternion = new THREE.Quaternion()
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
    arrowRef.current.position.set(0, 0, 0)
    arrowRef.current.setRotationFromQuaternion(quaternion)
    arrowRef.current.children[0].position.y = length
    arrowRef.current.children[1].position.y = length / 2
    arrowRef.current.children[1].scale.y = length / 2
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
            className="bloch-canvas-3d"
            style={{ cursor: 'grab' }}
          />
        </div>

        <div className="bloch-info">
          <div className="card">
            <h2 className="card-title">State Information</h2>
            {state && (
              <div className="state-info-grid">
                <div className="info-item">
                  <span className="info-label">|0⟩ amplitude:</span>
                  <span className="info-value">{state['0'].real.toFixed(4)} + {state['0'].imag.toFixed(4)}i</span>
                </div>
                <div className="info-item">
                  <span className="info-label">|1⟩ amplitude:</span>
                  <span className="info-value">{state['1'].real.toFixed(4)} + {state['1'].imag.toFixed(4)}i</span>
                </div>
                <div className="info-item">
                  <span className="info-label">|0⟩ probability:</span>
                  <span className="info-value">{(state['0'].probability * 100).toFixed(2)}%</span>
                </div>
                <div className="info-item">
                  <span className="info-label">|1⟩ probability:</span>
                  <span className="info-value">{(state['1'].probability * 100).toFixed(2)}%</span>
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