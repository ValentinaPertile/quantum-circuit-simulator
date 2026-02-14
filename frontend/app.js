const API_URL = 'http://127.0.0.1:5000/api';
let operations = [];
let currentGate = null;

// Initialize qubit selectors
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

document.getElementById('numQubits').addEventListener('change', updateQubitSelectors);
updateQubitSelectors();

// Add gate
function addGate(gateName) {
    currentGate = gateName;
    const config = document.getElementById('gateConfig');
    const controlDiv = document.getElementById('controlQubitDiv');
    
    config.style.display = 'block';
    
    if (gateName === 'CNOT') {
        controlDiv.style.display = 'block';
    } else {
        controlDiv.style.display = 'none';
    }
}

// Confirm gate addition
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
    document.getElementById('gateConfig').style.display = 'none';
}

// Update operations list display
function updateOperationsList() {
    const list = document.getElementById('operationsList');
    
    if (operations.length === 0) {
        list.innerHTML = '<p class="text-gray-500 text-center py-8">No operations yet</p>';
        return;
    }
    
    list.innerHTML = operations.map((op, idx) => {
        let gateColor = 'bg-blue-600';
        if (op.gate === 'x') gateColor = 'bg-red-600';
        if (op.gate === 'y') gateColor = 'bg-green-600';
        if (op.gate === 'z') gateColor = 'bg-yellow-600';
        if (op.gate === 'cnot') gateColor = 'bg-purple-600';
        
        if (op.gate === 'cnot') {
            return `
                <div class="operation-chip bg-slate-700 p-3 rounded-lg border border-slate-600 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="${gateColor} px-3 py-1 rounded text-sm font-bold">CNOT</span>
                        <span class="text-gray-400 text-sm">control: q${op.control} → target: q${op.target}</span>
                    </div>
                    <button onclick="removeOperation(${idx})" class="text-red-400 hover:text-red-300">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="operation-chip bg-slate-700 p-3 rounded-lg border border-slate-600 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="${gateColor} px-3 py-1 rounded text-sm font-bold">${op.gate.toUpperCase()}</span>
                        <span class="text-gray-400 text-sm">qubit ${op.target}</span>
                    </div>
                    <button onclick="removeOperation(${idx})" class="text-red-400 hover:text-red-300">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }
    }).join('');
}

function removeOperation(idx) {
    operations.splice(idx, 1);
    updateOperationsList();
}

// Simulate circuit
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

// Display results
function displayResults(data) {
    const amplitudesDiv = document.getElementById('amplitudesDisplay');
    const entanglementDiv = document.getElementById('entanglementDisplay');
    
    // Display amplitudes
    let html = '<div class="space-y-3">';
    for (const [state, amp] of Object.entries(data.amplitudes)) {
        const prob = amp.probability;
        const percentage = (prob * 100).toFixed(1);
        
        html += `
            <div>
                <div class="flex justify-between mb-1">
                    <span class="font-mono font-bold">|${state}⟩</span>
                    <span class="text-gray-400">${percentage}%</span>
                </div>
                <div class="bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div class="probability-bar h-full rounded-full" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }
    html += '</div>';
    amplitudesDiv.innerHTML = html;
    
    // Display entanglement
    if (data.entanglement) {
        const ent = data.entanglement;
        const isEntangled = ent.is_entangled;
        
        entanglementDiv.innerHTML = `
            <div class="space-y-3">
                <div class="p-3 rounded-lg ${isEntangled ? 'bg-pink-900 border border-pink-700' : 'bg-green-900 border border-green-700'}">
                    <p class="font-bold text-center text-lg">
                        ${isEntangled ? '<i class="fas fa-link mr-2"></i>ENTANGLED' : '<i class="fas fa-unlink mr-2"></i>NOT ENTANGLED'}
                    </p>
                </div>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Classification:</span>
                        <span class="font-semibold">${ent.classification}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Concurrence:</span>
                        <span class="font-mono">${ent.concurrence.toFixed(4)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Entropy:</span>
                        <span class="font-mono">${ent.entropy.toFixed(4)}</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        entanglementDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Available for 2-qubit systems</p>';
    }
}

// Load Bell state preset
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
            displayResults(data);
        }
    } catch (error) {
        alert('Failed to load preset. Make sure the Python server is running.');
        console.error(error);
    }
}

// Load Activity 5.4.3 example
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
    alert('Loaded circuit from Activity 5.4.3! Click "Run Simulation" to execute.');
}

// Clear circuit
function clearCircuit() {
    operations = [];
    updateOperationsList();
    document.getElementById('amplitudesDisplay').innerHTML = '<p class="text-gray-500 text-center py-8">Run simulation to see results</p>';
    document.getElementById('entanglementDisplay').innerHTML = '<p class="text-gray-500 text-center py-4">Available for 2-qubit systems</p>';
}