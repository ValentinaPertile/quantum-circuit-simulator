const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'

export async function simulateCircuit(numQubits, operations, initialState = null) {
  const response = await fetch(`${API_URL}/simulate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      num_qubits: numQubits,
      operations: operations,
      initial_state: initialState
    })
  })

  if (!response.ok) {
    throw new Error('Failed to simulate circuit')
  }

  return await response.json()
}

export async function loadPreset(presetName) {
  const response = await fetch(`${API_URL}/presets/${presetName}`)
  
  if (!response.ok) {
    throw new Error('Failed to load preset')
  }

  return await response.json()
}

export async function healthCheck() {
  try {
    const response = await fetch(`${API_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}