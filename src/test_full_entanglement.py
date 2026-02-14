import numpy as np
from src.quantum_state import QuantumState
from src.gates import hadamard, cnot, apply_single_qubit_gate, apply_two_qubit_gate
from src.entanglement import measure_entanglement_entropy

# Test 1: Separable state
print("=== State |00⟩ ===")
state1 = QuantumState(2)
result1 = measure_entanglement_entropy(state1)
print(f"State: {state1}")
print(f"Results: {result1}")
print()

# Test 2: Bell state
print("=== Bell State ===")
state2 = QuantumState(2)
state2.state_vector = apply_single_qubit_gate(
    state2.state_vector, hadamard(), 0, 2
)
state2.state_vector = apply_two_qubit_gate(
    state2.state_vector, cnot(), 0, 1, 2
)
result2 = measure_entanglement_entropy(state2)
print(f"State: {state2}")
print(f"Results: {result2}")
print()

# Test 3: Partially entangled state
print("=== Partially Entangled State ===")
state3 = QuantumState(2)
# Create superposition: 0.8|00⟩ + 0.6|11⟩
state3.state_vector = np.array([0.8, 0, 0, 0.6], dtype=complex)
result3 = measure_entanglement_entropy(state3)
print(f"State: {state3}")
print(f"Results: {result3}")