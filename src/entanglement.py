"""
Entanglement analysis for quantum states.
"""
import numpy as np
from typing import Tuple


def calculate_density_matrix(state_vector: np.ndarray) -> np.ndarray:
    """
    Calculate the density matrix from a state vector.
    
    Args:
        state_vector: Pure state vector
        
    Returns:
        Density matrix (outer product of state with itself)
    """
    state_vector = state_vector.reshape(-1, 1)
    return state_vector @ state_vector.conj().T


def partial_trace(density_matrix: np.ndarray, keep_qubit: int = 0) -> np.ndarray:
    """
    Calculate the partial trace of a 2-qubit density matrix.
    
    Args:
        density_matrix: 4x4 density matrix of 2-qubit system
        keep_qubit: Which qubit to keep (0 or 1)
        
    Returns:
        2x2 reduced density matrix
    """
    if density_matrix.shape != (4, 4):
        raise ValueError("Density matrix must be 4x4 for 2-qubit system")
    
    reduced = np.zeros((2, 2), dtype=complex)
    
    if keep_qubit == 0:
        # Trace out qubit 1
        reduced[0, 0] = density_matrix[0, 0] + density_matrix[1, 1]
        reduced[0, 1] = density_matrix[0, 2] + density_matrix[1, 3]
        reduced[1, 0] = density_matrix[2, 0] + density_matrix[3, 1]
        reduced[1, 1] = density_matrix[2, 2] + density_matrix[3, 3]
    else:
        # Trace out qubit 0
        reduced[0, 0] = density_matrix[0, 0] + density_matrix[2, 2]
        reduced[0, 1] = density_matrix[0, 1] + density_matrix[2, 3]
        reduced[1, 0] = density_matrix[1, 0] + density_matrix[3, 2]
        reduced[1, 1] = density_matrix[1, 1] + density_matrix[3, 3]
    
    return reduced


def von_neumann_entropy(state_vector: np.ndarray) -> float:
    """
    Calculate the von Neumann entropy of a subsystem.
    
    Args:
        state_vector: State vector of the full system
        
    Returns:
        von Neumann entropy
    """
    density_matrix = calculate_density_matrix(state_vector)
    reduced = partial_trace(density_matrix, keep_qubit=0)
    
    # Get eigenvalues
    eigenvalues = np.linalg.eigvalsh(reduced)
    
    # Filter out near-zero eigenvalues to avoid log(0)
    eigenvalues = eigenvalues[eigenvalues > 1e-10]
    
    if len(eigenvalues) == 0:
        return 0.0
    
    # Calculate entropy: -sum(λ * log2(λ))
    entropy = -np.sum(eigenvalues * np.log2(eigenvalues))
    
    return float(entropy)


def is_entangled(state_vector: np.ndarray, threshold: float = 1e-10) -> bool:
    """
    Check if a 2-qubit state is entangled.
    
    Args:
        state_vector: State vector of 2-qubit system
        threshold: Threshold for considering entropy non-zero
        
    Returns:
        True if entangled, False if separable
    """
    entropy = von_neumann_entropy(state_vector)
    return entropy > threshold


def calculate_concurrence(state_vector: np.ndarray) -> float:
    """
    Calculate the concurrence of a 2-qubit state.
    
    Args:
        state_vector: State vector of 2-qubit system
        
    Returns:
        Concurrence value (0 = separable, 1 = maximally entangled)
    """
    if len(state_vector) != 4:
        raise ValueError("State vector must have 4 components for 2-qubit system")
    
    # For pure states: C = 2|a*d - b*c|
    a, b, c, d = state_vector
    concurrence = 2 * abs(a * d - b * c)
    
    return float(min(concurrence, 1.0))


def measure_entanglement_entropy(state_vector: np.ndarray) -> dict:
    """
    Comprehensive entanglement analysis for 2-qubit systems.
    
    Args:
        state_vector: State vector of the 2-qubit system
        
    Returns:
        Dictionary with entanglement metrics
    """
    entropy = von_neumann_entropy(state_vector)
    concurrence_value = calculate_concurrence(state_vector)
    is_entangled_state = is_entangled(state_vector)
    
    # Classify entanglement
    if not is_entangled_state:
        classification = "separable"
    elif concurrence_value > 0.99:
        classification = "maximally entangled"
    elif concurrence_value > 0.7:
        classification = "highly entangled"
    elif concurrence_value > 0.3:
        classification = "moderately entangled"
    else:
        classification = "weakly entangled"
    
    return {
        'is_entangled': bool(is_entangled_state),
        'entropy': float(entropy),
        'concurrence': float(concurrence_value),
        'classification': classification
    }