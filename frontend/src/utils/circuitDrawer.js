import * as d3 from 'd3'

export function drawCircuit(svgElement, numQubits, operations) {
  d3.select(svgElement).selectAll('*').remove()

  const width = svgElement.clientWidth || 800
  const height = 350
  const svg = d3.select(svgElement).attr('viewBox', '0 0 ' + width + ' ' + height)

  if (operations.length === 0) return

  const startX = 80
  const startY = 60
  const qubitSpacing = 80
  const gateSpacing = 100
  const gateWidth = 60

  // Detectar tema actual
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  const wireColor = isDark ? '#4a4a3a' : '#ddd5c3'
  const textColor = isDark ? '#e8e4d9' : '#5a5a5a'

  for (let i = 0; i < numQubits; i++) {
    const y = startY + i * qubitSpacing
    const lineLength = startX + operations.length * gateSpacing + 50

    svg.append('line')
      .attr('x1', startX)
      .attr('y1', y)
      .attr('x2', lineLength)
      .attr('y2', y)
      .attr('stroke', wireColor)
      .attr('stroke-width', 2)

    svg.append('text')
      .attr('x', startX - 40)
      .attr('y', y + 5)
      .attr('text-anchor', 'end')
      .attr('fill', textColor)
      .attr('font-size', '14px')
      .attr('font-family', 'Georgia')
      .text('q' + i)
  }

  operations.forEach((op, idx) => {
    const x = startX + idx * gateSpacing
    if (op.gate === 'cnot') {
      drawCNOT(svg, x, startY, op.control, op.target, qubitSpacing, isDark)
    } else if (op.gate === 'measure') {
      drawMeasurement(svg, x, startY, op.target, qubitSpacing, isDark)
    } else {
      drawSingleGate(svg, x, startY, op.gate, op.target, qubitSpacing, gateWidth, isDark)
    }
  })
}

function drawSingleGate(svg, x, startY, gateName, qubit, qubitSpacing, gateWidth, isDark) {
  const y = startY + qubit * qubitSpacing
  const gateColors = isDark ? {
    h: '#8a9d7d',
    x: '#9db08e',
    y: '#7a8d6f',
    z: '#b0c29f'
  } : {
    h: '#6b7f5f',
    x: '#8a9d7d',
    y: '#556349',
    z: '#9db08e'
  }

  const strokeColor = isDark ? '#4a4a3a' : '#556349'

  svg.append('rect')
    .attr('x', x - gateWidth / 2)
    .attr('y', y - 25)
    .attr('width', gateWidth)
    .attr('height', 50)
    .attr('rx', 5)
    .attr('fill', gateColors[gateName] || (isDark ? '#8a9d7d' : '#6b7f5f'))
    .attr('stroke', strokeColor)
    .attr('stroke-width', 2)

  svg.append('text')
    .attr('x', x)
    .attr('y', y + 5)
    .attr('text-anchor', 'middle')
    .attr('fill', isDark ? '#1a1a16' : 'white')
    .attr('font-size', '18px')
    .attr('font-weight', 'bold')
    .attr('font-family', 'Georgia')
    .text(gateName.toUpperCase())
}

function drawCNOT(svg, x, startY, control, target, qubitSpacing, isDark) {
  const controlY = startY + control * qubitSpacing
  const targetY = startY + target * qubitSpacing
  const color = isDark ? '#8a9d7d' : '#6b7f5f'

  svg.append('line')
    .attr('x1', x)
    .attr('y1', controlY)
    .attr('x2', x)
    .attr('y2', targetY)
    .attr('stroke', color)
    .attr('stroke-width', 3)

  svg.append('circle')
    .attr('cx', x)
    .attr('cy', controlY)
    .attr('r', 8)
    .attr('fill', color)

  svg.append('circle')
    .attr('cx', x)
    .attr('cy', targetY)
    .attr('r', 20)
    .attr('fill', isDark ? '#2d2d28' : 'white')
    .attr('stroke', color)
    .attr('stroke-width', 3)

  svg.append('line')
    .attr('x1', x - 12)
    .attr('y1', targetY)
    .attr('x2', x + 12)
    .attr('y2', targetY)
    .attr('stroke', color)
    .attr('stroke-width', 3)

  svg.append('line')
    .attr('x1', x)
    .attr('y1', targetY - 12)
    .attr('x2', x)
    .attr('y2', targetY + 12)
    .attr('stroke', color)
    .attr('stroke-width', 3)
}

function drawMeasurement(svg, x, startY, qubit, qubitSpacing, isDark) {
  const y = startY + qubit * qubitSpacing
  const color = isDark ? '#a87d6f' : '#8a7d5f'

  svg.append('rect')
    .attr('x', x - 25)
    .attr('y', y - 25)
    .attr('width', 50)
    .attr('height', 50)
    .attr('rx', 5)
    .attr('fill', isDark ? '#2d2d28' : 'white')
    .attr('stroke', color)
    .attr('stroke-width', 3)

  const arc = d3.arc().innerRadius(0).outerRadius(15).startAngle(-Math.PI / 2).endAngle(Math.PI / 2)

  svg.append('path')
    .attr('d', arc)
    .attr('transform', 'translate(' + x + ',' + (y + 5) + ')')
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 2)

  svg.append('line')
    .attr('x1', x)
    .attr('y1', y + 5)
    .attr('x2', x + 10)
    .attr('y2', y - 10)
    .attr('stroke', color)
    .attr('stroke-width', 2)
}