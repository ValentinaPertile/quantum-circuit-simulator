import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import Header from './components/Header'
import GateSelector from './components/GateSelector'
import CircuitVisualizer from './components/CircuitVisualizer'
import OperationsList from './components/OperationsList'
import Results from './components/Results'
import CodeEditor from './components/CodeEditor'
import './App.css'

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [activeTab, setActiveTab] = useState('circuit')
  const [showCodeTab, setShowCodeTab] = useState(false)  // NUEVO
  const [numQubits, setNumQubits] = useState(2)
  const [operations, setOperations] = useState([])
  const [results, setResults] = useState(null)
  const [theme, setTheme] = useState('light')

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

  const loadPreset = (preset) => {
    if (preset === 'bell') {
      setOperations([
        { gate: 'h', target: 0 },
        { gate: 'cnot', control: 0, target: 1 }
      ])
      setNumQubits(2)
    } else if (preset === 'activity') {
      setOperations([
        { gate: 'h', target: 0 },
        { gate: 'cnot', control: 0, target: 1 },
        { gate: 'h', target: 1 },
        { gate: 'cnot', control: 1, target: 0 }
      ])
      setNumQubits(2)
    }
  }

  const handleShowCode = () => {
    setShowCodeTab(true)    // NUEVO
    setActiveTab('code')    // NUEVO
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

      {/* SOLO MOSTRAR TABS SI showCodeTab ES TRUE */}
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

      {activeTab === 'circuit' ? (
        <div className="main-grid">
          <div className="column">
            <GateSelector 
              numQubits={numQubits}
              onNumQubitsChange={setNumQubits}
              onAddOperation={addOperation}
              onLoadPreset={loadPreset}
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
              onShowCode={handleShowCode}  // CAMBIADO
              numQubits={numQubits}
            />
          </div>

          <div className="column">
            <Results results={results} numQubits={numQubits} />
          </div>
        </div>
      ) : (
        <CodeEditor 
          operations={operations}
          numQubits={numQubits}
        />
      )}
    </div>
  )
}

export default App