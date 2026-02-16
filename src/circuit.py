"""
Quantum Circuit class - main interface for building quantum circuits.
"""

import numpy as np
from typing import List, Tuple, Dict
from src.quantum_state import QuantumState
from src.gates import (
    QuantumGate, hadamard, pauli_x, pauli_y, pauli_z, cnot, swap,
    apply_single_qubit_gate, apply_two_qubit_gate
)
from src.entanglement import is_entangled, measure_entanglement_entropy


class QuantumCircuit:
    """
    Main class for building and simulating quantum circuits.
    
    Example usage:
        circuit = QuantumCircuit(2)
        circuit.h(0)          # Hadamard on qubit 0
        circuit.cnot(0, 1)    # CNOT with control=0, target=1
        circuit.measure()     # Measure all qubits
    """
    
    def __init__(self, num_qubits: int, initial_state: str = None):
        """
        Initialize a quantum circuit.
        
        Args:
            num_qubits: Number of qubits in the circuit
            initial_state: Initial state as binary string (default: |00...0⟩)
        """
        self.num_qubits = num_qubits
        self.state = QuantumState(num_qubits, initial_state)
        self.operations = []  # Track applied operations
    
    def _apply_single_gate(self, gate: QuantumGate, target: int):
        """Apply a single-qubit gate and track the operation."""
        self.state.state_vector = apply_single_qubit_gate(
            self.state.state_vector, gate, target, self.num_qubits
        )
        self.operations.append({
            'gate': gate.name,
            'qubits': [target],
            'type': 'single'
        })
    
    def _apply_two_gate(self, gate: QuantumGate, control: int, target: int):
        """Apply a two-qubit gate and track the operation."""
        self.state.state_vector = apply_two_qubit_gate(
            self.state.state_vector, gate, control, target, self.num_qubits
        )
        self.operations.append({
            'gate': gate.name,
            'qubits': [control, target],
            'type': 'two'
        })
    
    # Single-qubit gates
    
    def h(self, target: int):
        """Apply Hadamard gate to target qubit."""
        self._apply_single_gate(hadamard(), target)
        return self  # Allow chaining: circuit.h(0).x(1)
    
    def x(self, target: int):
        """Apply Pauli-X (NOT) gate to target qubit."""
        self._apply_single_gate(pauli_x(), target)
        return self
    
    def y(self, target: int):
        """Apply Pauli-Y gate to target qubit."""
        self._apply_single_gate(pauli_y(), target)
        return self
    
    def z(self, target: int):
        """Apply Pauli-Z gate to target qubit."""
        self._apply_single_gate(pauli_z(), target)
        return self
    
    # Two-qubit gates
    
    def cnot(self, control: int, target: int):
        """Apply CNOT gate with specified control and target qubits."""
        self._apply_two_gate(cnot(), control, target)
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
    
    # Measurement and analysis
    
    def measure(self, qubit_index: int = None) -> Tuple[str, float]:
        """
        Measure the quantum state.
        
        Args:
            qubit_index: Specific qubit to measure (None = measure all)
            
        Returns:
            Tuple of (outcome, probability)
        """
        return self.state.measure(qubit_index)
    
    def get_state(self) -> QuantumState:
        """Get the current quantum state."""
        return self.state
    
    def get_statevector(self) -> np.ndarray:
        """Get the state vector as numpy array."""
        return self.state.state_vector
    
    def get_amplitudes(self) -> Dict[str, complex]:
        """Get all non-zero amplitudes."""
        return self.state.get_amplitudes()
    
    def is_entangled(self) -> bool:
        """Check if the state is entangled (only for 2-qubit systems)."""
        if self.num_qubits != 2:
            raise ValueError("Entanglement check only for 2-qubit systems")
        return is_entangled(self.state)
    
    def analyze_entanglement(self) -> Dict:
        """Full entanglement analysis (only for 2-qubit systems)."""
        if self.num_qubits != 2:
            raise ValueError("Entanglement analysis only for 2-qubit systems")
        return measure_entanglement_entropy(self.state)
    
    def get_operations(self) -> List[Dict]:
        """Get list of all operations applied to the circuit."""
        return self.operations
    
    def reset(self):
        """Reset circuit to initial state."""
        self.state = QuantumState(self.num_qubits)
        self.operations = []
    
    def __str__(self) -> str:
        """String representation showing the current state."""
        return f"QuantumCircuit({self.num_qubits} qubits): {self.state}"
    
    def __repr__(self) -> str:
        return self.__str__()


def create_bell_state(bell_type: str = '00') -> QuantumCircuit:
    """
    Create one of the four Bell states (maximally entangled states).
    
    Args:
        bell_type: '00' (Φ+), '01' (Ψ+), '10' (Φ-), or '11' (Ψ-)
        
    Returns:
        QuantumCircuit with the Bell state prepared
        
    Bell states:
        |Φ+⟩ = (|00⟩ + |11⟩)/√2  (bell_type='00')
        |Ψ+⟩ = (|01⟩ + |10⟩)/√2  (bell_type='01')
        |Φ-⟩ = (|00⟩ - |11⟩)/√2  (bell_type='10')
        |Ψ-⟩ = (|01⟩ - |10⟩)/√2  (bell_type='11')
    """
    circuit = QuantumCircuit(2)
    circuit.h(0)
    circuit.cnot(0, 1)
    
    # For other bell types, add gates:
    if bell_type == '01':
        circuit.x(1)  # Apply X to qubit 1
    elif bell_type == '10':
        circuit.z(0)  # Apply Z to qubit 0
    elif bell_type == '11':
        circuit.x(1)
        circuit.z(0)
    
    return circuit


def create_ghz_state(num_qubits: int = 3) -> QuantumCircuit:
    """
    Create a GHZ (Greenberger–Horne–Zeilinger) state.
    
    For 3 qubits: |GHZ⟩ = (|000⟩ + |111⟩)/√2
    
    Args:
        num_qubits: Number of qubits (default: 3)
        
    Returns:
        QuantumCircuit with GHZ state
    """
    circuit = QuantumCircuit(num_qubits)
    
    # Apply Hadamard to first qubit
    circuit.h(0)
    
    # Apply CNOT chain
    for i in range(num_qubits - 1):
        circuit.cnot(i, i + 1)
    
    return circuit