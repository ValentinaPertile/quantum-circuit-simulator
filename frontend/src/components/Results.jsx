import React, { useState, useEffect } from 'react'
import { generatePythonCode, generateQiskitCode } from '../utils/codeGenerator'

function CodeEditor({ operations, numQubits }) {
  const [format, setFormat] = useState('python')
  const [code, setCode] = useState('')
  const [isEditable, setIsEditable] = useState(false)

  useEffect(() => {
    if (format === 'python') {
      setCode(generatePythonCode(operations, numQubits))
    } else if (format === 'qiskit') {
      setCode(generateQiskitCode(operations, numQubits))
    }
  }, [format, operations, numQubits])

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      alert('Code copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy:', err)
    })
  }

  const handleDownload = () => {
    const extension = format === 'python' ? 'py' : 'py'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quantum_circuit.${extension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const highlightSyntax = (text) => {
    return text
      .replace(/#.*/g, '<span class="code-comment">$&</span>')
      .replace(/\b(from|import|def|class|if|else|for|while|return|print)\b/g, '<span class="code-keyword">$&</span>')
      .replace(/(['"].*?['"])/g, '<span class="code-string">$&</span>')
      .replace(/\b(\d+)\b/g, '<span class="code-number">$&</span>')
      .replace(/(\w+)\(/g, '<span class="code-function">$1</span>(')
  }

  return (
    <div className="code-page">
      <div className="code-editor-container">
        <div className="code-toolbar">
          <div className="code-toolbar-title">
            {format === 'python' ? 'Python Code' : 'Qiskit Code'}
          </div>
          <div className="code-toolbar-actions">
            <select 
              className="export-format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="python">Python (NumPy)</option>
              <option value="qiskit">Qiskit (IBM)</option>
            </select>
            <button className="btn btn-secondary" onClick={() => setIsEditable(!isEditable)}>
              {isEditable ? 'View Mode' : 'Edit Mode'}
            </button>
            <button className="btn btn-secondary" onClick={handleCopy}>
              Copy
            </button>
            <button className="btn btn-primary" onClick={handleDownload}>
              Download
            </button>
          </div>
        </div>
        
        <div className="code-editor">
          {isEditable ? (
            <textarea 
              className="code-editable"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
            />
          ) : (
            <pre 
              className="python-code"
              dangerouslySetInnerHTML={{ __html: highlightSyntax(code) }}
            />
          )}
        </div>
      </div>

      {format === 'qiskit' && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 className="card-title">About Qiskit Export</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <strong>Qiskit</strong> is IBM's open-source quantum computing framework. 
            The exported code can be run on IBM's quantum simulators or real quantum hardware through IBM Quantum Experience.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
            To use this code, install Qiskit: <code style={{ background: 'var(--beige-200)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>pip install qiskit</code>
          </p>
        </div>
      )}
    </div>
  )
}

export default CodeEditor