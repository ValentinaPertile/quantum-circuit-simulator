"""
Entanglement analysis for quantum states.
"""
import numpy as np
from src.quantum_state import QuantumState


def calculate_density_matrix(state: QuantumState) -> np.ndarray:
    """
    Calculate the density matrix ρ = |ψ⟩⟨ψ| of a pure state.
    
    Args:
        state: QuantumState
        
    Returns:
        Density matrix as numpy array
    """
    psi = state.state_vector.reshape(-1, 1)  # Column vector
    return psi @ psi.conj().T  # |ψ⟩⟨ψ|


def partial_trace(density_matrix: np.ndarray, keep_qubit: int, num_qubits: int) -> np.ndarray:
    """
    Calculate the partial trace to get reduced density matrix.
    
    For a 2-qubit system, traces out one qubit to analyze the other.
    
    Args:
        density_matrix: Full density matrix
        keep_qubit: Which qubit to keep (0 or 1)
        num_qubits: Total number of qubits
        
    Returns:
        Reduced density matrix for the kept qubit
    """
    if num_qubits != 2:
        raise NotImplementedError("Only implemented for 2-qubit systems")
    
    # Dimension of each qubit
    d = 2
    
    # Reshape to tensor form
    rho_tensor = density_matrix.reshape(d, d, d, d)
    
    if keep_qubit == 0:
        # Trace out qubit 1 (sum over indices 1 and 3)
        rho_reduced = np.trace(rho_tensor, axis1=1, axis2=3)
    else:
        # Trace out qubit 0 (sum over indices 0 and 2)
        rho_reduced = np.trace(rho_tensor, axis1=0, axis2=2)
    
    return rho_reduced


def von_neumann_entropy(density_matrix: np.ndarray) -> float:
    """
    Calculate Von Neumann entropy S = -Tr(ρ log₂ ρ).
    
    For a pure state: S = 0
    For a maximally mixed state: S = log₂(d) where d is dimension
    
    Args:
        density_matrix: Density matrix
        
    Returns:
        Entropy value
    """
    # Get eigenvalues
    eigenvalues = np.linalg.eigvalsh(density_matrix)
    
    # Filter out zero or negative eigenvalues (numerical noise)
    eigenvalues = eigenvalues[eigenvalues > 1e-10]
    
    # S = -Σ λᵢ log₂(λᵢ)
    entropy = -np.sum(eigenvalues * np.log2(eigenvalues))
    
    return entropy


def is_entangled(state: QuantumState, tolerance: float = 1e-6) -> bool:
    """
    Determine if a two-qubit state is entangled.
    
    Method: Calculate the Von Neumann entropy of the reduced density matrix.
    - If entropy ≈ 0: state is separable (not entangled)
    - If entropy > 0: state is entangled
    
    Args:
        state: Two-qubit QuantumState
        tolerance: Numerical tolerance for entropy
        
    Returns:
        True if entangled, False otherwise
    """
    if state.num_qubits != 2:
        raise ValueError("Entanglement analysis only for 2-qubit systems")
    
    rho = calculate_density_matrix(state)
    rho_reduced = partial_trace(rho, keep_qubit=0, num_qubits=2)
    entropy = von_neumann_entropy(rho_reduced)
    
    return entropy > tolerance


def calculate_concurrence(state: QuantumState) -> float:
    """
    Calculate concurrence - another entanglement measure.
    
    For 2 qubits: C ∈ [0, 1]
    - C = 0: separable
    - C = 1: maximally entangled (Bell state)
    
    Args:
        state: Two-qubit QuantumState
        
    Returns:
        Concurrence value
    """
    if state.num_qubits != 2:
        raise ValueError("Concurrence only for 2-qubit systems")
    
    # Get state vector
    psi = state.state_vector
    
    # For computational basis |00⟩, |01⟩, |10⟩, |11⟩
    # Extract amplitudes
    a00, a01, a10, a11 = psi[0], psi[1], psi[2], psi[3]
    
    # Concurrence formula for pure states
    concurrence = 2 * np.abs(a00 * a11 - a01 * a10)
    
    return np.real(concurrence)


def measure_entanglement_entropy(state: QuantumState) -> dict:
    """
    Comprehensive entanglement analysis.
    
    Returns:
        Dictionary with:
        - 'is_entangled': bool
        - 'entropy': float (Von Neumann entropy)
        - 'concurrence': float
        - 'classification': str ('separable', 'partially entangled', 'maximally entangled')
    """
    # Verificar si está entrelazado
    entangled = is_entangled(state)
    
    # Calcular concurrencia
    conc = calculate_concurrence(state)
    
    # Calcular entropía
    rho = calculate_density_matrix(state)
    rho_reduced = partial_trace(rho, keep_qubit=0, num_qubits=2)
    entropy = von_neumann_entropy(rho_reduced)
    
    # Clasificar según concurrencia
    if conc < 0.1:
        classification = 'separable'
    elif conc < 0.9:
        classification = 'partially entangled'
    else:
        classification = 'maximally entangled'
    
    return {
        'is_entangled': entangled,
        'entropy': entropy,
        'concurrence': conc,
        'classification': classification
    }