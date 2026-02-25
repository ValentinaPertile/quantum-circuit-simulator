import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import Header from './components/Header'
import { saveSimulationToHistory } from './components/SimulationHistory'
import SimulationHistory from './components/SimulationHistory'
import GateSelector from './components/GateSelector'
import CircuitVisualizer from './components/CircuitVisualizer'
import OperationsList from './components/OperationsList'
import Results from './components/Results'
import CodeEditor from './components/CodeEditor'
import StepByStep from './components/StepByStep'
import BlochSphere from './components/BlochSphere.jsx'
import SaveCircuitModal from './components/SaveCircuitModal'
import LoadCircuitModal from './components/LoadCircuitModal'
import ConfirmDialog from './components/ConfirmDialog'
import { saveCircuit, importCircuit } from './utils/circuitStorage'
import './App.css'

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [activeTab, setActiveTab] = useState('circuit')
  const [numQubits, setNumQubits] = useState(2)
  const [initialState, setInitialState] = useState('00')
  const [operations, setOperations] = useState([])
  const [results, setResults] = useState(null)
  const [theme, setTheme] = useState('light')
  
  // History for undo/redo
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Modal states
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(null) // { message, onConfirm }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [historyIndex, history])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // Save state to history
  const saveToHistory = (newOperations) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newOperations])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const addOperation = (operation) => {
    const newOps = [...operations, operation]
    setOperations(newOps)
    saveToHistory(newOps)
  }

  const removeOperation = (index) => {
    const newOps = operations.filter((_, i) => i !== index)
    setOperations(newOps)
    saveToHistory(newOps)
  }

  const reorderOperations = (startIndex, endIndex) => {
    const newOps = Array.from(operations)
    const [removed] = newOps.splice(startIndex, 1)
    newOps.splice(endIndex, 0, removed)
    setOperations(newOps)
    saveToHistory(newOps)
  }

  const clearCircuit = () => {
    setOperations([])
    setResults(null)
    saveToHistory([])
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setOperations(history[historyIndex - 1])
      setResults(null)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setOperations(history[historyIndex + 1])
      setResults(null)
    }
  }

  const handleNumQubitsChange = (newNumQubits) => {
    const wouldLoseOperations = operations.some(op => {
      if (op.target !== undefined && op.target >= newNumQubits) return true
      if (op.control !== undefined && (op.control >= newNumQubits || op.target >= newNumQubits)) return true
      return false
    })

    if (wouldLoseOperations && operations.length > 0) {
      setConfirmDialog({
        message: 'Changing the number of qubits will remove some operations that reference non-existent qubits. Continue?',
        onConfirm: () => {
          const validOperations = operations.filter(op => {
            if (op.target !== undefined && op.target >= newNumQubits) return false
            if (op.control !== undefined && (op.control >= newNumQubits || op.target >= newNumQubits)) return false
            return true
          })
          setNumQubits(newNumQubits)
          setInitialState('0'.repeat(newNumQubits))
          setOperations(validOperations)
          setResults(null)
          saveToHistory(validOperations)
          setConfirmDialog(null)
        }
      })
    } else {
      setNumQubits(newNumQubits)
      setInitialState('0'.repeat(newNumQubits))
      setResults(null)
    }
  }

  const loadPreset = (preset) => {
    let newOps = []
    if (preset === 'bell') {
      newOps = [
        { gate: 'h', target: 0 },
        { gate: 'cnot', control: 0, target: 1 }
      ]
      setNumQubits(2)
      setInitialState('00')
    } else if (preset === 'activity') {
      newOps = [
        { gate: 'h', target: 0 },
        { gate: 'cnot', control: 0, target: 1 },
        { gate: 'h', target: 1 },
        { gate: 'cnot', control: 1, target: 0 }
      ]
      setNumQubits(2)
      setInitialState('00')
    }
    setOperations(newOps)
    saveToHistory(newOps)
  }

  const handleSaveCircuit = (circuitName) => {
    if (operations.length === 0) {
      alert('Cannot save empty circuit')
      return
    }

    const circuit = {
      name: circuitName,
      numQubits: numQubits,
      initialState: initialState,
      operations: operations
    }

    saveCircuit(circuit)
    alert(`Circuit "${circuitName}" saved successfully!`)
  }

  const handleLoadCircuit = (circuit) => {
    setNumQubits(circuit.numQubits)
    setInitialState(circuit.initialState)
    setOperations(circuit.operations)
    setResults(null)
    saveToHistory(circuit.operations)
    alert(`Circuit "${circuit.name}" loaded successfully!`)
  }

  const handleImportCircuit = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const circuit = await importCircuit(file)
      
      if (!circuit.numQubits || !circuit.operations) {
        throw new Error('Invalid circuit file format')
      }

      setNumQubits(circuit.numQubits)
      setInitialState(circuit.initialState || '0'.repeat(circuit.numQubits))
      setOperations(circuit.operations)
      setResults(null)
      saveToHistory(circuit.operations)
      alert('Circuit imported successfully!')
    } catch (error) {
      alert(`Failed to import circuit: ${error.message}`)
    }

    event.target.value = ''
  }

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />
  }

  return (
    <div className="app">
      <Header 
        theme={theme}
        onToggleTheme={toggleTheme}
        onBackToHome={() => setShowLanding(true)}
      />

      {/* Main navigation tabs */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'circuit' ? 'active' : ''}`}
          onClick={() => setActiveTab('circuit')}
        >
          Circuit Builder
        </button>
        <button 
          className={`nav-tab ${activeTab === 'stepbystep' ? 'active' : ''}`}
          onClick={() => setActiveTab('stepbystep')}
          disabled={operations.length === 0}
        >
          Step-by-Step
        </button>
        <button 
          className={`nav-tab ${activeTab === 'bloch' ? 'active' : ''}`}
          onClick={() => setActiveTab('bloch')}
          disabled={numQubits !== 1}
        >
          Bloch Sphere
        </button>
        <button 
          className={`nav-tab ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          Python Code
        </button>
      </div>

      {/* Storage toolbar - only show in circuit builder */}
      {activeTab === 'circuit' && (
        <div className="storage-toolbar">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowSaveModal(true)}
            disabled={operations.length === 0}
          >
             Save Circuit
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowLoadModal(true)}
          >
             Load Circuit
          </button>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
             Import
            <input 
              type="file" 
              accept=".json"
              onChange={handleImportCircuit}
              style={{ display: 'none' }}
            />
          </label>
          <SimulationHistory />
          
          {/* Undo/Redo buttons */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
               Undo
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              Redo
            </button>
          </div>
        </div>
      )}

      {/* Render content based on active tab */}
      {activeTab === 'circuit' && (
        <div className="main-grid">
          <div className="column">
            <GateSelector 
              numQubits={numQubits}
              onNumQubitsChange={handleNumQubitsChange}
              onAddOperation={addOperation}
              onLoadPreset={loadPreset}
              initialState={initialState}
              onInitialStateChange={setInitialState}
            />
          </div>

          <div className="column">
            <CircuitVisualizer 
              numQubits={numQubits}
              operations={operations}
            />
            <OperationsList 
              operations={operations}
              onRemove={removeOperation}
              onReorder={reorderOperations}
              onClear={clearCircuit}
              onSimulate={(data) => {
                setResults(data)
                if (data && data.success) {
                  saveSimulationToHistory(numQubits, operations, data.amplitudes)
                }
              }}
              numQubits={numQubits}
              initialState={initialState}
            />
          </div>

          <div className="column">
            <Results 
              results={results} 
              numQubits={numQubits}
              operations={operations}
              initialState={initialState}
            />
          </div>
        </div>
      )}

      {activeTab === 'stepbystep' && (
        <StepByStep 
          operations={operations}
          numQubits={numQubits}
          initialState={initialState}
        />
      )}

      {activeTab === 'bloch' && numQubits === 1 && (
        <BlochSphere 
          operations={operations}
          initialState={initialState}
        />
      )}

      {activeTab === 'code' && (
        <CodeEditor 
          operations={operations}
          numQubits={numQubits}
        />
      )}

      {/* Modals */}
      {showSaveModal && (
        <SaveCircuitModal 
          onSave={handleSaveCircuit}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {showLoadModal && (
        <LoadCircuitModal 
          onLoad={handleLoadCircuit}
          onClose={() => setShowLoadModal(false)}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  )
}

export default App