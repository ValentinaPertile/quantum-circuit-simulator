from src.quantum_state import QuantumState
from src.gates import hadamard, pauli_x, cnot, apply_single_qubit_gate, apply_two_qubit_gate

# Test 1: Hadamard on |0⟩
print("=== Test 1: Hadamard ===")
state = QuantumState(1)
print("Before:", state)

h_gate = hadamard()
state.state_vector = apply_single_qubit_gate(
    state.state_vector, h_gate, target_qubit=0, num_qubits=1
)
print("After applying H:", state)
print()

# Test 2: CNOT on |00⟩

print("=== Test 2: CNOT on |00⟩ ===")
state2 = QuantumState(2)
print("Before:", state2)

cnot_gate = cnot()
state2.state_vector = apply_two_qubit_gate(
    state2.state_vector, cnot_gate, 
    control_qubit=0, target_qubit=1, num_qubits=2
)
print("After applying CNOT:", state2)
print()

# Test 3: H on q1, then CNOT → Bell state
print("=== Test 3: Bell State ===")
state3 = QuantumState(2)
print("Initial:", state3)

# H on qubit 0
state3.state_vector = apply_single_qubit_gate(
    state3.state_vector, hadamard(), target_qubit=0, num_qubits=2
)
print("After applying H on q0:", state3)

# CNOT
state3.state_vector = apply_two_qubit_gate(
    state3.state_vector, cnot_gate,
    control_qubit=0, target_qubit=1, num_qubits=2
)
print("After applying CNOT (Bell state):", state3)