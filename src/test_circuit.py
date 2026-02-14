import numpy as np
from src.circuit import QuantumCircuit, create_bell_state, create_ghz_state

# Test 1: Basic circuit operations
print("=== Test 1: Basic Operations ===")
circuit = QuantumCircuit(2)
print(f"Initial state: {circuit}")

circuit.h(0)
print(f"After H(0): {circuit}")

circuit.cnot(0, 1)
print(f"After CNOT(0,1): {circuit}")

print(f"Is entangled? {circuit.is_entangled()}")
print(f"Operations: {circuit.get_operations()}")
print()

# Test 2: Method chaining
print("=== Test 2: Method Chaining ===")
circuit2 = QuantumCircuit(2).h(0).cnot(0, 1)
print(f"Chained operations: {circuit2}")
print()

# Test 3: Bell state creation
print("=== Test 3: Bell States ===")
bell = create_bell_state('00')
print(f"Bell state Φ+: {bell}")
analysis = bell.analyze_entanglement()
print(f"Entanglement analysis: {analysis}")
print()

# Test 4: All Bell states
print("=== Test 4: All Bell States ===")
for bell_type in ['00', '01', '10', '11']:
    bell = create_bell_state(bell_type)
    print(f"Bell state {bell_type}: {bell.get_state()}")
print()

# Test 5: GHZ state
print("=== Test 5: GHZ State ===")
ghz = create_ghz_state(3)
print(f"GHZ state (3 qubits): {ghz}")
print()

# Test 6: Measurement
print("=== Test 6: Measurement (Bell state) ===")
bell_circuit = create_bell_state('00')
for i in range(5):
    outcome, prob = bell_circuit.measure()
    print(f"Measurement {i+1}: {outcome} (probability: {prob:.4f})")