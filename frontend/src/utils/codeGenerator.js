export function generatePythonCode(operations, numQubits, circuitName = "circuit") {
  if (!operations || !Array.isArray(operations)) {
    operations = []
  }
  
  let code = `# Quantum Circuit - ${circuitName}\n`
  code += `from src.circuit import QuantumCircuit\n\n`
  code += `# Create circuit with ${numQubits} qubit${numQubits > 1 ? 's' : ''}\n`
  code += `${circuitName} = QuantumCircuit(${numQubits})\n\n`
  
  if (operations.length === 0) {
    code += `# Add gates here\n`
    return code
  }
  
  code += `# Apply gates\n`
  operations.forEach((op, idx) => {
    if (op.gate === 'cnot') {
      code += `${circuitName}.cnot(${op.control}, ${op.target})  # CNOT with control=q${op.control}, target=q${op.target}\n`
    } else if (op.gate === 'measure') {
      code += `outcome${idx} = ${circuitName}.measure_qubit(${op.target})  # Measure qubit ${op.target}\n`
      code += `print(f"Qubit ${op.target} measured: {outcome${idx}}")\n`
    } else {
      code += `${circuitName}.${op.gate}(${op.target})  # ${op.gate.toUpperCase()} gate on qubit ${op.target}\n`
    }
  })
  
  code += `\n# Display results\n`
  code += `print(f"State: {${circuitName}}")\n`
  
  if (numQubits === 2) {
    code += `print(f"Entangled: {${circuitName}.is_entangled()}")\n`
    code += `\n# Full analysis\n`
    code += `analysis = ${circuitName}.analyze_entanglement()\n`
    code += `print(f"Analysis: {analysis}")\n`
  }
  
  return code
}

export function generateQiskitCode(operations, numQubits) {
  if (!operations || !Array.isArray(operations)) {
    operations = []
  }
  
  let code = `# Quantum Circuit with Qiskit\n`
  code += `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\n`
  code += `from qiskit import execute, Aer\n`
  code += `from qiskit.visualization import plot_histogram, plot_bloch_multivector\n\n`
  
  code += `# Create quantum and classical registers\n`
  code += `qr = QuantumRegister(${numQubits}, 'q')\n`
  code += `cr = ClassicalRegister(${numQubits}, 'c')\n`
  code += `circuit = QuantumCircuit(qr, cr)\n\n`
  
  if (operations.length === 0) {
    code += `# Add gates here\n`
  } else {
    code += `# Apply gates\n`
    operations.forEach((op) => {
      if (op.gate === 'h') {
        code += `circuit.h(qr[${op.target}])  # Hadamard gate\n`
      } else if (op.gate === 'x') {
        code += `circuit.x(qr[${op.target}])  # Pauli-X gate\n`
      } else if (op.gate === 'y') {
        code += `circuit.y(qr[${op.target}])  # Pauli-Y gate\n`
      } else if (op.gate === 'z') {
        code += `circuit.z(qr[${op.target}])  # Pauli-Z gate\n`
      } else if (op.gate === 'cnot') {
        code += `circuit.cx(qr[${op.control}], qr[${op.target}])  # CNOT gate\n`
      } else if (op.gate === 'measure') {
        code += `circuit.measure(qr[${op.target}], cr[${op.target}])  # Measure qubit ${op.target}\n`
      }
    })
  }
  
  code += `\n# Visualize circuit\n`
  code += `print(circuit.draw())\n\n`
  
  code += `# Run simulation\n`
  code += `simulator = Aer.get_backend('statevector_simulator')\n`
  code += `job = execute(circuit, simulator)\n`
  code += `result = job.result()\n`
  code += `statevector = result.get_statevector()\n\n`
  
  code += `# Display results\n`
  code += `print("Statevector:")\n`
  code += `print(statevector)\n\n`
  
  code += `# Optional: Run on quantum simulator with shots\n`
  code += `# backend = Aer.get_backend('qasm_simulator')\n`
  code += `# job = execute(circuit, backend, shots=1024)\n`
  code += `# result = job.result()\n`
  code += `# counts = result.get_counts()\n`
  code += `# plot_histogram(counts)\n`
  
  return code
}