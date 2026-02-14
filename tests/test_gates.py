"""
Unit tests for quantum gates.
"""
import pytest
import numpy as np
from src.gates import (
    hadamard, pauli_x, pauli_y, pauli_z, cnot,
    apply_single_qubit_gate, apply_two_qubit_gate
)
from src.quantum_state import QuantumState


def test_hadamard_gate():
    """Test Hadamard gate creates superposition."""
    h = hadamard()
    assert h.name == 'H'
    assert h.num_qubits == 1
    
    # Apply to |0⟩
    state = QuantumState(1)
    state.state_vector = apply_single_qubit_gate(
        state.state_vector, h, 0, 1
    )
    
    # Should be (|0⟩ + |1⟩)/√2
    assert np.allclose(state.state_vector[0], 1/np.sqrt(2))
    assert np.allclose(state.state_vector[1], 1/np.sqrt(2))


def test_pauli_x_gate():
    """Test Pauli-X gate flips qubit."""
    x = pauli_x()
    assert x.name == 'X'
    
    # Apply to |0⟩
    state = QuantumState(1)
    state.state_vector = apply_single_qubit_gate(
        state.state_vector, x, 0, 1
    )
    
    # Should be |1⟩
    assert np.allclose(state.state_vector[0], 0.0)
    assert np.allclose(state.state_vector[1], 1.0)


def test_pauli_z_gate():
    """Test Pauli-Z gate phase flip."""
    z = pauli_z()
    assert z.name == 'Z'
    assert z.num_qubits == 1


def test_cnot_gate():
    """Test CNOT gate."""
    cnot_gate = cnot()
    assert cnot_gate.name == 'CNOT'
    assert cnot_gate.num_qubits == 2
    
    # Test on |00⟩ - should stay |00⟩
    state = QuantumState(2)
    state.state_vector = apply_two_qubit_gate(
        state.state_vector, cnot_gate, 0, 1, 2
    )
    assert np.allclose(state.state_vector[0], 1.0)


def test_bell_state_creation():
    """Test creating Bell state with H + CNOT."""
    state = QuantumState(2)
    
    # Apply H to qubit 0
    h = hadamard()
    state.state_vector = apply_single_qubit_gate(
        state.state_vector, h, 0, 2
    )
    
    # Apply CNOT
    cnot_gate = cnot()
    state.state_vector = apply_two_qubit_gate(
        state.state_vector, cnot_gate, 0, 1, 2
    )
    
    # Should be (|00⟩ + |11⟩)/√2
    expected = np.array([1/np.sqrt(2), 0, 0, 1/np.sqrt(2)])
    assert np.allclose(state.state_vector, expected)