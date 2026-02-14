from src.quantum_state import QuantumState, is_normalized

# Create|00⟩
state = QuantumState(2)
print("Estado inicial:", state)
print("¿Está normalizado?:", is_normalized(state))

# Create |11⟩
state2 = QuantumState(2, initial_state='11')
print("\nEstado |11⟩:", state2)
print("¿Está normalizado?:", is_normalized(state2))