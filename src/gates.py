"""
Quantum Gates implementation.
"""
import numpy as np
from typing import List


class QuantumGate:
    """Base class for quantum gates."""
    
    def __init__(self, name: str, matrix: np.ndarray, num_qubits: int):
        """
        Initialize a quantum gate.
        
        Args:
            name: Gate name (e.g., 'H', 'X', 'CNOT')
            matrix: Unitary matrix representing the gate
            num_qubits: Number of qubits the gate acts on
        """
        self.name = name
        self.matrix = matrix
        self.num_qubits = num_qubits
    
    def __str__(self):
        return f"{self.name} Gate"


# Single-qubit gates

def hadamard() -> QuantumGate:
    """
    Hadamard gate (H).
    Creates superposition: |0⟩ → (|0⟩ + |1⟩)/√2
    """
    matrix = np.array([
        [1,  1],
        [1, -1]
    ], dtype=complex) / np.sqrt(2)
    
    return QuantumGate("H", matrix, num_qubits=1)


def pauli_x() -> QuantumGate:
    """
    Pauli-X gate (NOT gate).
    Flips: |0⟩ → |1⟩, |1⟩ → |0⟩
    """
    matrix = np.array([
        [0, 1],
        [1, 0]
    ], dtype=complex)
    
    return QuantumGate("X", matrix, num_qubits=1)


def pauli_y() -> QuantumGate:
    """
    Pauli-Y gate.
    """
    matrix = np.array([
        [0, -1j],
        [1j, 0]
    ], dtype=complex)
    
    return QuantumGate("Y", matrix, num_qubits=1)


def pauli_z() -> QuantumGate:
    """
    Pauli-Z gate.
    Phase flip: |1⟩ → -|1⟩
    """
    # TODO: Implementa la matriz de Pauli-Z
    # Pista: [[1, 0], [0, -1]]
    matrix = np.array([
        [1, 0],
        [0, -1]
    ], dtype=complex)
    
    return QuantumGate("Z", matrix, num_qubits=1)


# Two-qubit gates

def cnot() -> QuantumGate:
    """
    Controlled-NOT (CNOT) gate.
    Flips target qubit if control qubit is |1⟩.
    
    Matrix form (4x4):
    |00⟩ → |00⟩
    |01⟩ → |01⟩
    |10⟩ → |11⟩  (flips second qubit)
    |11⟩ → |10⟩  (flips second qubit)
    """
    matrix = np.array([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 1],
        [0, 0, 1, 0]
    ], dtype=complex)
    
    return QuantumGate("CNOT", matrix, num_qubits=2)


def swap() -> QuantumGate:
    """
    SWAP gate.
    Swaps two qubits: |01⟩ ↔ |10⟩
    """
    # TODO: Implementa la matriz SWAP
    # Pista: |00⟩→|00⟩, |01⟩→|10⟩, |10⟩→|01⟩, |11⟩→|11⟩
    matrix = np.array([
        [1, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 1]
    ], dtype=complex)
    
    return QuantumGate("SWAP", matrix, num_qubits=2)


# Helper functions

def apply_single_qubit_gate(state_vector: np.ndarray, gate: QuantumGate, 
                           target_qubit: int, num_qubits: int) -> np.ndarray:
    """
    Apply a single-qubit gate to a target qubit in a multi-qubit state.
    
    Args:
        state_vector: Current state vector
        gate: Single-qubit gate to apply
        target_qubit: Index of qubit to apply gate to (0-indexed)
        num_qubits: Total number of qubits in the system
        
    Returns:
        New state vector after applying the gate
    """
    # Create identity matrices for other qubits
    identity = np.eye(2, dtype=complex)
    
    # Build the full gate matrix using tensor products
    if target_qubit == 0:
        full_gate = gate.matrix
        for i in range(1, num_qubits):
            full_gate = np.kron(full_gate, identity)
    else:
        full_gate = identity
        for i in range(1, num_qubits):
            if i == target_qubit:
                full_gate = np.kron(full_gate, gate.matrix)
            else:
                full_gate = np.kron(full_gate, identity)
    
    return full_gate @ state_vector


def apply_two_qubit_gate(state_vector: np.ndarray, gate: QuantumGate,
                         control_qubit: int, target_qubit: int, 
                         num_qubits: int) -> np.ndarray:
    """
    Apply a two-qubit gate (like CNOT) to a multi-qubit state.
    
    Args:
        state_vector: Current state vector
        gate: Two-qubit gate to apply
        control_qubit: Index of control qubit
        target_qubit: Index of target qubit
        num_qubits: Total number of qubits
        
    Returns:
        New state vector
    """
    # For 2-qubit systems, directly apply the gate
    if num_qubits == 2:
        # Check if qubits are in the right order
        if control_qubit == 0 and target_qubit == 1:
            return gate.matrix @ state_vector
        elif control_qubit == 1 and target_qubit == 0:
            # Need to swap qubit order
            swap_gate = swap()
            temp = swap_gate.matrix @ state_vector
            temp = gate.matrix @ temp
            return swap_gate.matrix @ temp
    
    # For more qubits, this gets complex - simplified version
    raise NotImplementedError("Multi-qubit gates for >2 qubits not fully implemented")


def rotation_x(theta: float) -> QuantumGate:
    """
    Rotation around X-axis by angle theta.
    
    Args:
        theta: Rotation angle in radians
        
    Returns:
        RX gate
    """
    
    matrix = np.array([
        [np.cos(theta/2), -1j * np.sin(theta/2)],
        [-1j * np.sin(theta/2), np.cos(theta/2)]
    ], dtype=complex)
    
    return QuantumGate("RX", matrix, num_qubits=1)