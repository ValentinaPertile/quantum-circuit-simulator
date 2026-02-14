"""
Unit tests for QuantumCircuit class.
"""
import pytest
import numpy as np
from src.circuit import QuantumCircuit, create_bell_state, create_ghz_state


def test_circuit_initialization():
    """Test circuit initialization."""
    circuit = QuantumCircuit(2)
    assert circuit.num_qubits == 2
    assert len(circuit.operations) == 0


def test_single_qubit_gates():
    """Test applying single-qubit gates."""
    circuit = QuantumCircuit(1)
    
    circuit.h(0)
    assert len(circuit.operations) == 1
    assert circuit.operations[0]['gate'] == 'H'
    
    circuit.x(0)
    assert len(circuit.operations) == 2


def test_two_qubit_gates():
    """Test applying two-qubit gates."""
    circuit = QuantumCircuit(2)
    circuit.cnot(0, 1)
    
    assert len(circuit.operations) == 1
    assert circuit.operations[0]['gate'] == 'CNOT'
    assert circuit.operations[0]['qubits'] == [0, 1]


def test_method_chaining():
    """Test method chaining."""
    circuit = QuantumCircuit(2).h(0).x(1).cnot(0, 1)
    assert len(circuit.operations) == 3


def test_bell_state():
    """Test Bell state creation."""
    bell = create_bell_state('00')
    assert bell.is_entangled()
    
    analysis = bell.analyze_entanglement()
    assert analysis['is_entangled'] == True
    assert analysis['classification'] == 'maximally entangled'


def test_all_bell_states():
    """Test all four Bell states."""
    for bell_type in ['00', '01', '10', '11']:
        bell = create_bell_state(bell_type)
        assert bell.num_qubits == 2
        assert bell.is_entangled()


def test_reset():
    """Test circuit reset."""
    circuit = QuantumCircuit(2)
    circuit.h(0).cnot(0, 1)
    
    circuit.reset()
    assert len(circuit.operations) == 0
    assert np.allclose(circuit.get_statevector()[0], 1.0)


def test_get_amplitudes():
    """Test getting amplitudes from circuit."""
    circuit = QuantumCircuit(2)
    circuit.h(0)
    
    amps = circuit.get_amplitudes()
    assert '00' in amps
    assert '10' in amps


def test_measure():
    """Test measurement returns valid outcome."""
    circuit = QuantumCircuit(2)
    outcome, prob = circuit.measure()
    
    assert outcome in ['00', '01', '10', '11']
    assert 0 <= prob <= 1