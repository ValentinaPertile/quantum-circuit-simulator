export function saveCircuit(circuit) {
  const circuits = getCircuits()
  const newCircuit = {
    id: Date.now().toString(),
    name: circuit.name || `Circuit ${circuits.length + 1}`,
    timestamp: new Date().toISOString(),
    numQubits: circuit.numQubits,
    initialState: circuit.initialState,
    operations: circuit.operations
  }
  
  circuits.push(newCircuit)
  localStorage.setItem('quantum_circuits', JSON.stringify(circuits))
  return newCircuit
}

export function getCircuits() {
  const data = localStorage.getItem('quantum_circuits')
  return data ? JSON.parse(data) : []
}

export function loadCircuit(id) {
  const circuits = getCircuits()
  return circuits.find(c => c.id === id)
}

export function deleteCircuit(id) {
  const circuits = getCircuits().filter(c => c.id !== id)
  localStorage.setItem('quantum_circuits', JSON.stringify(circuits))
}

export function renameCircuit(id, newName) {
  const circuits = getCircuits()
  const circuit = circuits.find(c => c.id === id)
  if (circuit) {
    circuit.name = newName
    localStorage.setItem('quantum_circuits', JSON.stringify(circuits))
  }
}

export function exportCircuit(circuit) {
  const dataStr = JSON.stringify(circuit, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${circuit.name.replace(/\s+/g, '_')}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function importCircuit(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const circuit = JSON.parse(e.target.result)
        resolve(circuit)
      } catch (error) {
        reject(new Error('Invalid circuit file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}