"""
Quantum Circuit implementation.
"""
import numpy as np
from src.quantum_state import QuantumState
from src.gates import apply_single_qubit_gate, apply_two_qubit_gate, hadamard, pauli_x, pauli_y, pauli_z, cnot, swap


class QuantumCircuit:
    """
    Represents a quantum circuit with multiple qubits.
    """
    
    def __init__(self, num_qubits: int, initial_state: str = None):
        """
        Initialize a quantum circuit.
        
        Args:
            num_qubits: Number of qubits in the circuit
            initial_state: Initial state as binary string (e.g., '01', '10')
                          If None, defaults to all |0⟩
        """
        self.num_qubits = num_qubits
        
        if initial_state is None:
            # Default: all qubits in |0⟩
            self.state = QuantumState(num_qubits)
        else:
            # Custom initial state
            if len(initial_state) != num_qubits:
                raise ValueError(f"Initial state length must match num_qubits ({num_qubits})")
            
            # Create state vector with 1 at the position of the initial state
            dim = 2 ** num_qubits
            state_vector = np.zeros(dim, dtype=complex)
            state_index = int(initial_state, 2)  # Convert binary string to index
            state_vector[state_index] = 1.0
            
            self.state = QuantumState(num_qubits)
            self.state.state_vector = state_vector
        
        self.operations = []
    
    def h(self, target: int):
        """Apply Hadamard gate to target qubit."""
        self.state.state_vector = apply_single_qubit_gate(
            self.state.state_vector, 
            hadamard(), 
            target, 
            self.num_qubits
        )
        self.operations.append({
            'gate': 'H',
            'qubits': [target],
            'type': 'single'
        })
        return self
    
    def x(self, target: int):
        """Apply Pauli-X gate to target qubit."""
        self.state.state_vector = apply_single_qubit_gate(
            self.state.state_vector, 
            pauli_x(), 
            target, 
            self.num_qubits
        )
        self.operations.append({
            'gate': 'X',
            'qubits': [target],
            'type': 'single'
        })
        return self
    
    def y(self, target: int):
        """Apply Pauli-Y gate to target qubit."""
        self.state.state_vector = apply_single_qubit_gate(
            self.state.state_vector, 
            pauli_y(), 
            target, 
            self.num_qubits
        )
        self.operations.append({
            'gate': 'Y',
            'qubits': [target],
            'type': 'single'
        })
        return self
    
    def z(self, target: int):
        """Apply Pauli-Z gate to target qubit."""
        self.state.state_vector = apply_single_qubit_gate(
            self.state.state_vector, 
            pauli_z(), 
            target, 
            self.num_qubits
        )
        self.operations.append({
            'gate': 'Z',
            'qubits': [target],
            'type': 'single'
        })
        return self
    
    def cnot(self, control: int, target: int):
        """Apply CNOT gate."""
        self.state.state_vector = apply_two_qubit_gate(
            self.state.state_vector,
            cnot(),
            control,
            target,
            self.num_qubits
        )
        self.operations.append({
            'gate': 'CNOT',
            'qubits': [control, target],
            'type': 'two_qubit'
        })
        return self
    
    def cx(self, control: int, target: int):
        """Alias for CNOT gate."""
        return self.cnot(control, target)
    
    def measure_qubit(self, target: int):
        """
        Measure a specific qubit (collapses that qubit's state).
        
        Args:
            target: Qubit to measure
            
        Returns:
            Measurement outcome (0 or 1)
        """
        outcome, prob = self.state.measure(qubit_index=target)
        
        # Record the measurement operation
        self.operations.append({
            'gate': 'MEASURE',
            'qubits': [target],
            'type': 'measurement',
            'outcome': outcome
        })
        
        return outcome
    
    def get_state(self):
        """Get the current quantum state."""
        return self.state
    
    def get_amplitudes(self):
        """Get amplitudes as a dictionary."""
        amplitudes = {}
        for i, amp in enumerate(self.state.state_vector):
            state_str = format(i, f'0{self.num_qubits}b')
            amplitudes[state_str] = amp
        return amplitudes
    
    def measure(self):
        """Measure all qubits."""
        return self.state.measure()
    
    def reset(self):
        """Reset the circuit to initial state."""
        self.state = QuantumState(self.num_qubits)
        self.operations = []
        return self
    
    def get_operations(self):
        """Get list of operations applied to the circuit."""
        return self.operations
    
    def is_entangled(self):
        """Check if the quantum state is entangled (only for 2-qubit systems)."""
        if self.num_qubits != 2:
            raise ValueError("Entanglement check only implemented for 2-qubit systems")
        
        from src.entanglement import is_entangled
        return is_entangled(self.state.state_vector)
    
    def analyze_entanglement(self):
        """Perform comprehensive entanglement analysis (only for 2-qubit systems)."""
        if self.num_qubits != 2:
            raise ValueError("Entanglement analysis only implemented for 2-qubit systems")
        
        from src.entanglement import measure_entanglement_entropy
        return measure_entanglement_entropy(self.state.state_vector)
    
    def __str__(self):
        """String representation of the circuit state."""
        return str(self.state)


def create_bell_state(state_type: str = '00'):
    """
    Create one of the four Bell states.
    
    Args:
        state_type: Type of Bell state ('00', '01', '10', '11')
                   '00' -> |Φ+⟩ = (|00⟩ + |11⟩)/√2
                   '01' -> |Ψ+⟩ = (|01⟩ + |10⟩)/√2
                   '10' -> |Φ-⟩ = (|00⟩ - |11⟩)/√2
                   '11' -> |Ψ-⟩ = (|01⟩ - |10⟩)/√2
    
    Returns:
        QuantumCircuit with the specified Bell state
    """
    circuit = QuantumCircuit(2)
    
    # Apply X gates based on state type
    if state_type[0] == '1':
        circuit.x(0)
    if state_type[1] == '1':
        circuit.x(1)
    
    # Create superposition and entanglement
    circuit.h(0)
    circuit.cnot(0, 1)
    
    # Apply Z gate for negative phase if needed
    if state_type == '10':
        circuit.z(0)
    
    return circuit


def create_ghz_state(num_qubits: int):
    """
    Create a GHZ (Greenberger-Horne-Zeilinger) state.
    For n qubits: (|00...0⟩ + |11...1⟩)/√2
    
    Note: Currently limited to 2 qubits due to gate implementation.
    
    Args:
        num_qubits: Number of qubits (currently only 2 supported)
    
    Returns:
        QuantumCircuit with GHZ state
    """
    if num_qubits < 2:
        raise ValueError("GHZ state requires at least 2 qubits")
    
    if num_qubits > 2:
        raise NotImplementedError("GHZ state for >2 qubits not yet implemented")
    
    circuit = QuantumCircuit(num_qubits)
    
    # Apply Hadamard to first qubit
    circuit.h(0)
    
    # Apply CNOT gates in sequence
    for i in range(num_qubits - 1):
        circuit.cnot(i, i + 1)
    
    return circuit