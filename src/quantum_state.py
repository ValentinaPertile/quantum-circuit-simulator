"""
Quantum State representation and operations.
"""
import numpy as np
from typing import List, Tuple


class QuantumState:
    """
    Represents a quantum state as a state vector.
    
    Attributes:
        num_qubits: Number of qubits in the state
        state_vector: Complex numpy array representing the state
    """
    
    def __init__(self, num_qubits: int, initial_state: str = None):
        """
        Initialize a quantum state.
        
        Args:
            num_qubits: Number of qubits
            initial_state: Binary string like '00', '01', '10', '11'
                          If None, initializes to |00...0⟩
        """
        self.num_qubits = num_qubits
        self.dim = 2 ** num_qubits
        
        if initial_state is None:
            # Default: |00...0⟩
            self.state_vector = np.zeros(self.dim, dtype=complex)
            self.state_vector[0] = 1.0
        else:
            self.state_vector = self._create_basis_state(initial_state)
    
    def _create_basis_state(self, binary_string: str) -> np.ndarray:
        """
        Create a computational basis state from binary string.
        
        Args:
            binary_string: e.g., '01' for |01⟩
            
        Returns:
            State vector
        """
        # TODO: Implement this function
        # Hint: Convert the binary string to a decimal index
        # and create a vector with 1.0 at that position
        index = int(binary_string, 2)
        state = np.zeros(self.dim, dtype=complex)
        state[index] = 1.0
        return state
    
    def measure(self, qubit_index: int = None) -> Tuple[str, float]:
        """
        Simulate measurement of the quantum state.
        
        Args:
            qubit_index: If None, measures all qubits
            
        Returns:
            Tuple of (outcome, probability)
        """
        probabilities = np.abs(self.state_vector) ** 2
        
        if qubit_index is None:
            # Measure all qubits
            outcome_index = np.random.choice(self.dim, p=probabilities)
            outcome = format(outcome_index, f'0{self.num_qubits}b')
            return outcome, probabilities[outcome_index]
        else:
            # TODO (optional): Implement single qubit measurement
            # For now, we only measure the entire system
            raise NotImplementedError("Single qubit measurement not yet implemented")
   
    def get_amplitudes(self) -> dict:
        """
        Get all non-zero amplitudes in the state.
        
        Returns:
            Dictionary mapping basis states to their amplitudes
        """
        amplitudes = {}
        for i, amplitude in enumerate(self.state_vector):
            if np.abs(amplitude) > 1e-10:  # Threshold for numerical noise
                basis_state = format(i, f'0{self.num_qubits}b')
                amplitudes[basis_state] = amplitude
        return amplitudes
    
    def __str__(self) -> str:
        """String representation of the quantum state."""
        amps = self.get_amplitudes()
        terms = []
        for basis, amp in amps.items():
            # Format complex number nicely
            if np.isreal(amp):
                coef = f"{amp.real:.3f}"
            else:
                coef = f"{amp.real:.3f}{amp.imag:+.3f}i"
            terms.append(f"{coef}|{basis}⟩")
        return " + ".join(terms)


def is_normalized(state: QuantumState, tolerance: float = 1e-10) -> bool:
    """
    Check if a quantum state is normalized.
    
    Args:
        state: QuantumState to check
        tolerance: Numerical tolerance
        
    Returns:
        True if normalized, False otherwise
    """

    total_prob = np.sum(np.abs(state.state_vector) ** 2)
    return abs(total_prob - 1.0) < tolerance