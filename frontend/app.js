const API_URL = 'http://127.0.0.1:5000/api';
let operations = [];
let currentGate = null;
let visualizer;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    visualizer = new CircuitVisualizer('circuitCanvas');
    updateQubitSelectors();
    loadTheme();
});

// Theme toggle
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    document.getElementById('themeIcon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeIcon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Qubit selectors
function updateQubitSelectors() {
    const numQubits = parseInt(document.getElementById('numQubits').value);
    const targetSelect = document.getElementById('targetQubit');
    const controlSelect = document.getElementById('controlQubit');
    
    targetSelect.innerHTML = '';
    controlSelect.innerHTML = '';
    
    for (let i = 0; i < numQubits; i++) {
        targetSelect.add(new Option(`Qubit ${i}`, i));
        controlSelect.add(new Option(`Qubit ${i}`, i));
    }
}

document.getElementById('numQubits').addEventListener('change', () => {
    updateQubitSelectors();
    updateCircuitVisualization();
});

// Gate operations
function addGate(gateName) {
    currentGate = gateName;
    const config = document.getElementById('gateConfig');
    const controlDiv = document.getElementById('controlQubitDiv');
    
    config.classList.remove('hidden');
    
    if (gateName === 'CNOT') {
        controlDiv.classList.remove('hidden');
    } else {
        controlDiv.classList.add('hidden');
    }
}

function confirmGate() {
    const target = parseInt(document.getElementById('targetQubit').value);
    const control = parseInt(document.getElementById('controlQubit').value);
    
    let operation;
    
    if (currentGate === 'CNOT') {
        if (control === target) {
            alert('Control and target qubits must be different!');
            return;
        }
        operation = {
            gate: currentGate.toLowerCase(),
            control: control,
            target: target
        };
    } else {
        operation = {
            gate: currentGate.toLowerCase(),
            target: target
        };
    }
    
    operations.push(operation);
    updateOperationsList();
    updateCircuitVisualization();
    document.getElementById('gateConfig').classList.add('hidden');
}

function updateOperationsList() {
    const list = document.getElementById('operationsList');
    
    if (operations.length === 0) {
        list.innerHTML = '<div class="circuit-empty">No operations yet</div>';
        return;
    }
    
    list.innerHTML = operations.map((op, idx) => {
        const gateName = op.gate.toUpperCase();
        const gateClass = op.gate;
        
        if (op.gate === 'cnot') {
            return `
                <div class="operation-item">
                    <div class="operation-info">
                        <span class="operation-badge ${gateClass}">${gateName}</span>
                        <span class="operation-details">control: q${op.control} → target: q${op.target}</span>
                    </div>
                    <button class="operation-remove" onclick="removeOperation(${idx})">✕</button>
                </div>
            `;
        } else {
            return `
                <div class="operation-item">
                    <div class="operation-info">
                        <span class="operation-badge ${gateClass}">${gateName}</span>
                        <span class="operation-details">qubit ${op.target}</span>
                    </div>
                    <button class="operation-remove" onclick="removeOperation(${idx})">✕</button>
                </div>
            `;
        }
    }).join('');
}

function removeOperation(idx) {
    operations.splice(idx, 1);
    updateOperationsList();
    updateCircuitVisualization();
}

function updateCircuitVisualization() {
    const numQubits = parseInt(document.getElementById('numQubits').value);
    visualizer.draw(numQubits, operations);
}

// Simulation
async function simulate() {
    const numQubits = parseInt(document.getElementById('numQubits').value);
    
    if (operations.length === 0) {
        alert('Add some gates first!');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/simulate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                num_qubits: numQubits,
                operations: operations
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayResults(data);
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Failed to connect to backend. Make sure the Python server is running on http://127.0.0.1:5000');
        console.error(error);
    }
}

function displayResults(data) {
    const amplitudesDiv = document.getElementById('amplitudesDisplay');
    const entanglementDiv = document.getElementById('entanglementDisplay');
    
    // Display amplitudes
    let html = '';
    for (const [state, amp] of Object.entries(data.amplitudes)) {
        const prob = amp.probability;
        const percentage = (prob * 100).toFixed(1);
        
        html += `
            <div class="amplitude-item">
                <div class="amplitude-header">
                    <span class="amplitude-state">|${state}⟩</span>
                    <span class="amplitude-probability">${percentage}%</span>
                </div>
                <div class="amplitude-bar-container">
                    <div class="amplitude-bar" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }
    amplitudesDiv.innerHTML = html;
    
    // Display entanglement
    if (data.entanglement) {
        const ent = data.entanglement;
        const isEntangled = ent.is_entangled;
        
        entanglementDiv.innerHTML = `
            <div class="entanglement-status ${isEntangled ? 'entangled' : 'not-entangled'}">
                ${isEntangled ? ' ENTANGLED' : ' NOT ENTANGLED'}
            </div>
            <div class="entanglement-metrics">
                <div class="metric-row">
                    <span class="metric-label">Classification:</span>
                    <span class="metric-value">${ent.classification}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Concurrence:</span>
                    <span class="metric-value">${ent.concurrence.toFixed(4)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Entropy:</span>
                    <span class="metric-value">${ent.entropy.toFixed(4)}</span>
                </div>
            </div>
        `;
    } else {
        entanglementDiv.innerHTML = '<div class="text-center text-muted"><p>Available for 2-qubit systems</p></div>';
    }
}

// Presets
async function loadBellState() {
    try {
        const response = await fetch(`${API_URL}/presets/bell`);
        const data = await response.json();
        
        if (data.success) {
            operations = [
                { gate: 'h', target: 0 },
                { gate: 'cnot', control: 0, target: 1 }
            ];
            document.getElementById('numQubits').value = 2;
            updateQubitSelectors();
            updateOperationsList();
            updateCircuitVisualization();
            displayResults(data);
        }
    } catch (error) {
        alert('Failed to load preset. Make sure the Python server is running.');
        console.error(error);
    }
}

function loadExample() {
    operations = [
        { gate: 'h', target: 0 },
        { gate: 'cnot', control: 0, target: 1 },
        { gate: 'h', target: 1 },
        { gate: 'cnot', control: 1, target: 0 }
    ];
    document.getElementById('numQubits').value = 2;
    updateQubitSelectors();
    updateOperationsList();
    updateCircuitVisualization();
    alert('Loaded circuit from Activity 5.4.3! Click "Run Simulation" to execute.');
}

function clearCircuit() {
    operations = [];
    updateOperationsList();
    updateCircuitVisualization();
    document.getElementById('amplitudesDisplay').innerHTML = '<div class="circuit-empty">Run simulation to see results</div>';
    document.getElementById('entanglementDisplay').innerHTML = '<div class="text-center text-muted"><p>Available for 2-qubit systems</p></div>';
}