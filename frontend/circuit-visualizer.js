/**
 * Circuit visualization using D3.js
 */

class CircuitVisualizer {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.width = 800;
        this.height = 400;
        this.qubitSpacing = 80;
        this.gateWidth = 60;
        this.gateSpacing = 100;
        
        this.svg = this.container
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
        
        this.svg.append('defs').html(`
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                    refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" 
                         fill="var(--text-secondary)" />
            </marker>
        `);
    }
    
    draw(numQubits, operations) {
        this.svg.selectAll('*:not(defs)').remove();
        
        if (operations.length === 0) {
            this.drawEmpty();
            return;
        }
        
        const startX = 80;
        const startY = 80;
        
        // Draw qubit wires
        for (let i = 0; i < numQubits; i++) {
            const y = startY + i * this.qubitSpacing;
            const lineLength = startX + operations.length * this.gateSpacing + 50;
            
            // Wire line
            this.svg.append('line')
                .attr('x1', startX)
                .attr('y1', y)
                .attr('x2', lineLength)
                .attr('y2', y)
                .attr('stroke', 'var(--border-color)')
                .attr('stroke-width', 2);
            
            // Qubit label
            this.svg.append('text')
                .attr('x', startX - 40)
                .attr('y', y + 5)
                .attr('text-anchor', 'end')
                .attr('fill', 'var(--text-secondary)')
                .attr('font-size', '14px')
                .text(`q${i}`);
        }
        
        // Draw gates
        operations.forEach((op, idx) => {
            const x = startX + idx * this.gateSpacing;
            
            if (op.gate === 'cnot') {
                this.drawCNOT(x, startY, op.control, op.target);
            } else {
                this.drawSingleGate(x, startY, op.gate, op.target);
            }
        });
    }
    
    drawSingleGate(x, startY, gateName, qubit) {
        const y = startY + qubit * this.qubitSpacing;
        const gateColors = {
            h: '#5b9fd8',
            x: '#e67e73',
            y: '#81c784',
            z: '#ffd54f'
        };
        
        // Gate box
        const rect = this.svg.append('rect')
            .attr('x', x - this.gateWidth / 2)
            .attr('y', y - 25)
            .attr('width', this.gateWidth)
            .attr('height', 50)
            .attr('rx', 5)
            .attr('fill', gateColors[gateName] || 'var(--accent-blue)')
            .attr('stroke', 'var(--border-color)')
            .attr('stroke-width', 2);
        
        // Gate label
        this.svg.append('text')
            .attr('x', x)
            .attr('y', y + 5)
            .attr('text-anchor', 'middle')
            .attr('fill', gateName === 'z' ? '#333' : 'white')
            .attr('font-size', '18px')
            .attr('font-weight', 'bold')
            .text(gateName.toUpperCase());
    }
    
    drawCNOT(x, startY, control, target) {
        const controlY = startY + control * this.qubitSpacing;
        const targetY = startY + target * this.qubitSpacing;
        
        // Vertical line connecting control and target
        this.svg.append('line')
            .attr('x1', x)
            .attr('y1', controlY)
            .attr('x2', x)
            .attr('y2', targetY)
            .attr('stroke', '#ba68c8')
            .attr('stroke-width', 3);
        
        // Control dot
        this.svg.append('circle')
            .attr('cx', x)
            .attr('cy', controlY)
            .attr('r', 8)
            .attr('fill', '#ba68c8');
        
        // Target (⊕)
        this.svg.append('circle')
            .attr('cx', x)
            .attr('cy', targetY)
            .attr('r', 20)
            .attr('fill', 'white')
            .attr('stroke', '#ba68c8')
            .attr('stroke-width', 3);
        
        // Plus sign
        this.svg.append('line')
            .attr('x1', x - 12)
            .attr('y1', targetY)
            .attr('x2', x + 12)
            .attr('y2', targetY)
            .attr('stroke', '#ba68c8')
            .attr('stroke-width', 3);
        
        this.svg.append('line')
            .attr('x1', x)
            .attr('y1', targetY - 12)
            .attr('x2', x)
            .attr('y2', targetY + 12)
            .attr('stroke', '#ba68c8')
            .attr('stroke-width', 3);
    }
    
    drawEmpty() {
        this.svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--text-muted)')
            .attr('font-size', '16px')
            .text('Add gates to visualize the circuit');
    }
}