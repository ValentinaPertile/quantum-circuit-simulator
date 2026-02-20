const API_URL = 'http://127.0.0.1:5000/api'

export async function simulateCircuit(numQubits, operations, initialState = null) {
  try {
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
      const errorData = await response.json()
      throw new Error(errorData.error || 'Simulation failed')
    }

    const data = await response.json()
    console.log('Simulation response:', data) // Debug
    return data
    
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export async function loadPreset(presetName) {
  try {
    const response = await fetch(`${API_URL}/presets/${presetName}`)
    
    if (!response.ok) {
      throw new Error('Failed to load preset')
    }

    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export async function healthCheck() {
  try {
    const response = await fetch(`${API_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}