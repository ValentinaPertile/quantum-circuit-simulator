import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import Header from './components/Header'
import GateSelector from './components/GateSelector'
import CircuitVisualizer from './components/CircuitVisualizer'
import OperationsList from './components/OperationsList'
import Results from './components/Results'
import CodeEditor from './components/CodeEditor'
import SaveCircuitModal from './components/SaveCircuitModal'
import LoadCircuitModal from './components/LoadCircuitModal'
import { saveCircuit, importCircuit } from './utils/circuitStorage'
import './App.css'

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [activeTab, setActiveTab] = useState('circuit')
  const [showCodeTab, setShowCodeTab] = useState(false)
  const [numQubits, setNumQubits] = useState(2)
  const [initialState, setInitialState] = useState('00')
  const [operations, setOperations] = useState([])
  const [results, setResults] = useState(null)
  const [theme, setTheme] = useState('light')
  
  // Modal states
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const addOperation = (operation) => {
    setOperations([...operations, operation])
  }

  const removeOperation = (index) => {
    setOperations(operations.filter((_, i) => i !== index))
  }

  const clearCircuit = () => {
    setOperations([])
    setResults(null)
  }

  const handleNumQubitsChange = (newNumQubits) => {
    // Check if there are operations that would become invalid
    const wouldLoseOperations = operations.some(op => {
      if (op.target !== undefined && op.target >= newNumQubits) return true
      if (op.control !== undefined && (op.control >= newNumQubits || op.target >= newNumQubits)) return true
      return false
    })
    
    if (wouldLoseOperations && operations.length > 0) {
      const confirmed = window.confirm(
        'Changing the number of qubits will remove some operations that reference non-existent qubits. Continue?'
      )
      if (!confirmed) {
        return
      }
    }
    
    setNumQubits(newNumQubits)
    setInitialState('0'.repeat(newNumQubits))
    
    // Filter valid operations
    const validOperations = operations.filter(op => {
      if (op.target !== undefined && op.target >= newNumQubits) return false
      if (op.control !== undefined && (op.control >= newNumQubits || op.target >= newNumQubits)) return false
      return true
    })
    
    setOperations(validOperations)
    setResults(null)
  }

  const loadPreset = (preset) => {
    if (preset === 'bell') {
      setOperations([
        { gate: 'h', target: 0 },
        { gate: 'cnot', control: 0, target: 1 }
      ])
      setNumQubits(2)
      setInitialState('00')
    } else if (preset === 'activity') {
      setOperations([
        { gate: 'h', target: 0 },
        { gate: 'cnot', control: 0, target: 1 },
        { gate: 'h', target: 1 },
        { gate: 'cnot', control: 1, target: 0 }
      ])
      setNumQubits(2)
      setInitialState('00')
    }
  }

  const handleShowCode = () => {
    setShowCodeTab(true)
    setActiveTab('code')
  }

  // Save circuit handler
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

  // Load circuit handler
  const handleLoadCircuit = (circuit) => {
    setNumQubits(circuit.numQubits)
    setInitialState(circuit.initialState)
    setOperations(circuit.operations)
    setResults(null)
    alert(`Circuit "${circuit.name}" loaded successfully!`)
  }

  // Import circuit handler
  const handleImportCircuit = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const circuit = await importCircuit(file)
      
      // Validate circuit structure
      if (!circuit.numQubits || !circuit.operations) {
        throw new Error('Invalid circuit file format')
      }

      setNumQubits(circuit.numQubits)
      setInitialState(circuit.initialState || '0'.repeat(circuit.numQubits))
      setOperations(circuit.operations)
      setResults(null)
      alert('Circuit imported successfully!')
    } catch (error) {
      alert(`Failed to import circuit: ${error.message}`)
    }

    // Reset file input
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

      {showCodeTab && (
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'circuit' ? 'active' : ''}`}
            onClick={() => setActiveTab('circuit')}
          >
            Circuit Builder
          </button>
          <button 
            className={`nav-tab ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            Python & Qiskit Code
          </button>
        </div>
      )}

      {/* Storage toolbar */}
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
        </div>
      )}

      {activeTab === 'circuit' ? (
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
              onClear={clearCircuit}
              onSimulate={setResults}
              onShowCode={handleShowCode}
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
      ) : (
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
    </div>
  )
}

export default App