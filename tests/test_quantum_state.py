"""
Unit tests for QuantumState class.
"""
import pytest
import numpy as np
from src.quantum_state import QuantumState, is_normalized


def test_initialization_default():
    """Test default initialization to |00⟩."""
    state = QuantumState(2)
    assert state.num_qubits == 2
    assert state.dim == 4
    assert np.allclose(state.state_vector[0], 1.0)
    assert np.allclose(state.state_vector[1:], 0.0)


def test_initialization_custom():
    """Test initialization to specific basis state."""
    state = QuantumState(2, initial_state='11')
    assert np.allclose(state.state_vector[3], 1.0)  # |11⟩ is index 3
    assert np.allclose(state.state_vector[:3], 0.0)


def test_is_normalized():
    """Test normalization check."""
    state = QuantumState(2)
    assert is_normalized(state)
    
    # Manually create unnormalized state
    # [1, 1, 1, 1] has sum of squares = 4, not 1
    state.state_vector = np.array([1.0, 1.0, 1.0, 1.0], dtype=complex)
    assert not is_normalized(state)
    
    # Also test another unnormalized case
    state.state_vector = np.array([0.9, 0.0, 0.0, 0.0], dtype=complex)
    assert not is_normalized(state)


def test_get_amplitudes():
    """Test amplitude extraction."""
    state = QuantumState(2)
    amps = state.get_amplitudes()
    assert '00' in amps
    assert amps['00'] == 1.0
    assert len(amps) == 1


def test_measure():
    """Test measurement."""
    state = QuantumState(2)
    outcome, prob = state.measure()
    assert outcome == '00'
    assert prob == 1.0


def test_string_representation():
    """Test __str__ method."""
    state = QuantumState(2)
    state_str = str(state)
    assert '|00⟩' in state_str