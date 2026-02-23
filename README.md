# Quantum Circuit Simulator

[EN] | [SP](#español)

---

## English

### Overview

A professional quantum computing platform featuring interactive visualization tools and real-time state analysis. This project was developed as a practical companion to reinforce concepts learned in The Open University's "Introduction to Quantum Computing" course, providing a visual and interactive way to understand quantum circuit behavior.

### Features

**Circuit Builder**
- Support for single-qubit gates (H, X, Y, Z, Measurement)
- Two-qubit CNOT gate implementation
- Undo/Redo functionality with keyboard shortcuts (Ctrl+Z / Ctrl+Y)
- Configurable initial state for each qubit

**Step-by-Step Execution**
- Execute circuits one gate at a time
- Visualize state evolution after each operation
- Track quantum state changes through circuit progression
- Navigate between steps using intuitive controls

**3D Bloch Sphere Visualization**
- Interactive Three.js-powered 3D representation
- Real-time state vector display for single-qubit systems
- Smooth rotation and zoom controls
- Visual representation of quantum superposition

**Entanglement Analysis**
- Comprehensive metrics for 2-qubit systems
- Von Neumann entropy calculation
- Concurrence measurement
- Entanglement classification (separable, weakly, moderately, highly, maximally entangled)

**State Visualization**
- Real-time circuit diagram rendering with D3.js
- Probability distribution display with interactive bars
- Mathematical notation in Dirac format
- Amplitude and phase information

**Code Export**
- Generate production-ready Python code using NumPy
- Export to IBM Qiskit format for quantum hardware execution
- Syntax highlighting and editing capabilities
- Copy to clipboard and download as .py files

**Circuit Storage**
- Save circuits to browser localStorage
- Load previously created circuits
- Export circuits as JSON files
- Import circuits from JSON format

### Technology Stack

**Frontend**
- React 18 with Vite build tool
- Three.js with three-stdlib for 3D Bloch sphere visualization
- D3.js for circuit diagram rendering
- Axios for API communication
- CSS custom properties for theming

**Backend**
- Python 3.8+ with HTTP server
- NumPy for quantum state vector simulation

**Architecture**
- Component-based React architecture
- Modular utility functions for quantum operations
- RESTful API design for backend communication
- LocalStorage for persistent client-side data

### Installation and Setup

#### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager

#### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/ValentinaPertile/quantum-circuit-simulator.git
cd quantum-circuit-simulator
```

2. Create and activate a Python virtual environment:
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install numpy
```

4. Start the backend server:
```bash
python src/simple_api.py
```

The backend will run on `http://127.0.0.1:5000`

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

#### Production Build

To create a production build of the frontend:
```bash
cd frontend
npm run build
```

The optimized files will be in the `frontend/dist` directory.

### Project Structure

```
quantum-circuit-simulator/
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main application
│   │   └── App.css            # Styling
│   ├── package.json
│   └── vite.config.js
├── src/
│   ├── quantum_state.py       # Quantum state vector
│   ├── gates.py               # Gate implementations
│   ├── circuit.py             # Circuit class
│   ├── entanglement.py        # Entanglement analysis
│   └── simple_api.py          # HTTP server
└── README.md
```

### Deployment

**Frontend (Vercel):**
1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`

**Backend (Railway):**
1. Create new project in Railway
2. Connect GitHub repository
3. Add environment variables if needed
4. Railway will auto-detect Python and deploy

### Usage

1. **Build a Circuit**: Select gates from the gate selector and configure target qubits
2. **Configure Initial State**: Set each qubit to |0⟩ or |1⟩
3. **Run Simulation**: Execute the circuit and view results
4. **Analyze Results**: Examine state probabilities and entanglement metrics
5. **Step Through**: Use step-by-step mode to understand each gate's effect
6. **Visualize**: View single-qubit states on the Bloch sphere
7. **Export Code**: Generate Python or Qiskit code for your circuit
8. **Save Work**: Store circuits locally for later use

### Future Improvements

**Quantum Algorithms**
- Implement Deutsch-Jozsa algorithm
- Add Grover's search algorithm
- Quantum teleportation protocol

**Advanced Gates**
- Toffoli (CCNOT) gate
- SWAP gate
- Parametric rotation gates (Rx, Ry, Rz)
- Phase gates (S, T, custom phase)

**Performance**
- Increase qubit limit beyond 3
- Add noise simulation

**Sharing and Collaboration**
- Generate shareable circuit links
- Export circuits as images/SVG
- LaTeX export for academic papers

### Contributing

Contributions are welcome. Please open an issue first to discuss proposed changes.

### Acknowledgments

- The Open University's "Introduction to Quantum Computing" course
- IBM Qiskit documentation for quantum computing concepts
- Three.js and D3.js communities for visualization libraries

---

## Español

Aquí está la traducción al español y la guía de deployment:

---

## Español

### Descripción General

Una plataforma profesional de computación cuántica con herramientas de visualización interactiva y análisis de estado en tiempo real. Este proyecto fue desarrollado como un complemento práctico para reforzar los conceptos aprendidos en el curso "Introduction to Quantum Computing" de The Open University, proporcionando una forma visual e interactiva de entender el comportamiento de los circuitos cuánticos.

### Funcionalidades

**Constructor de Circuitos**
- Soporte para compuertas de un qubit (H, X, Y, Z, Medición)
- Implementación de compuerta CNOT de dos qubits
- Funcionalidad Deshacer/Rehacer con atajos de teclado (Ctrl+Z / Ctrl+Y)
- Estado inicial configurable para cada qubit

**Ejecución Paso a Paso**
- Ejecutar circuitos una compuerta a la vez
- Visualizar la evolución del estado después de cada operación
- Seguir los cambios del estado cuántico a través de la progresión del circuito
- Navegar entre pasos usando controles intuitivos

**Visualización 3D de la Esfera de Bloch**
- Representación 3D interactiva con Three.js
- Visualización del vector de estado en tiempo real para sistemas de un qubit
- Controles suaves de rotación y zoom
- Representación visual de la superposición cuántica

**Análisis de Entrelazamiento**
- Métricas completas para sistemas de 2 qubits
- Cálculo de entropía de von Neumann
- Medición de concurrencia
- Clasificación de entrelazamiento (separable, débil, moderado, alto, máximo)

**Visualización de Estado**
- Renderizado de diagramas de circuito en tiempo real con D3.js
- Visualización de distribución de probabilidad con barras interactivas
- Notación matemática en formato de Dirac
- Información de amplitud y fase

**Exportación de Código**
- Generar código Python listo para producción usando NumPy
- Exportar a formato IBM Qiskit para ejecución en hardware cuántico
- Capacidades de resaltado de sintaxis y edición
- Copiar al portapapeles y descargar como archivos .py

**Almacenamiento de Circuitos**
- Guardar circuitos en localStorage del navegador
- Cargar circuitos creados previamente
- Exportar circuitos como archivos JSON
- Importar circuitos desde formato JSON

### Stack Tecnológico

**Frontend**
- React 18 con herramienta de construcción Vite
- Three.js con three-stdlib para visualización 3D de la esfera de Bloch
- D3.js para renderizado de diagramas de circuito
- Axios para comunicación con API
- Propiedades CSS personalizadas para temas

**Backend**
- Python 3.8+ con servidor HTTP
- NumPy para simulación de vector de estado cuántico

**Arquitectura**
- Arquitectura React basada en componentes
- Funciones de utilidad modulares para operaciones cuánticas
- Diseño de API RESTful para comunicación backend
- LocalStorage para datos persistentes del lado del cliente

### Instalación y Configuración

#### Requisitos Previos
- Python 3.8 o superior
- Node.js 16 o superior
- Gestor de paquetes npm o yarn

#### Configuración del Backend

1. Clonar el repositorio:
```bash
git clone https://github.com/ValentinaPertile/quantum-circuit-simulator.git
cd quantum-circuit-simulator
```

2. Crear y activar entorno virtual de Python:
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. Instalar dependencias de Python:
```bash
pip install numpy
```

4. Iniciar el servidor backend:
```bash
python src/simple_api.py
```

El backend se ejecutará en `http://127.0.0.1:5000`

#### Configuración del Frontend

1. Navegar al directorio frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

#### Build de Producción

Para crear un build de producción del frontend:
```bash
cd frontend
npm run build
```

Los archivos optimizados estarán en el directorio `frontend/dist`.

### Estructura del Proyecto

```
quantum-circuit-simulator/
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── utils/             # Funciones de utilidad
│   │   ├── App.jsx            # Aplicación principal
│   │   └── App.css            # Estilos
│   ├── package.json
│   └── vite.config.js
├── src/
│   ├── quantum_state.py       # Vector de estado cuántico
│   ├── gates.py               # Implementaciones de compuertas
│   ├── circuit.py             # Clase Circuit
│   ├── entanglement.py        # Análisis de entrelazamiento
│   └── simple_api.py          # Servidor HTTP
└── README.md
```

### Despliegue

**Frontend (Vercel):**
1. Conectar tu repositorio de GitHub a Vercel
2. Establecer directorio raíz en `frontend`
3. Comando de build: `npm run build`
4. Directorio de salida: `dist`

**Backend (Railway):**
1. Crear nuevo proyecto en Railway
2. Conectar repositorio de GitHub
3. Agregar variables de entorno si es necesario
4. Railway auto-detectará Python y desplegará

### Uso

1. **Construir un Circuito**: Seleccionar compuertas del selector y configurar qubits objetivo
2. **Configurar Estado Inicial**: Establecer cada qubit en |0⟩ o |1⟩
3. **Ejecutar Simulación**: Ejecutar el circuito y ver resultados
4. **Analizar Resultados**: Examinar probabilidades de estado y métricas de entrelazamiento
5. **Paso a Paso**: Usar modo paso a paso para entender el efecto de cada compuerta
6. **Visualizar**: Ver estados de un qubit en la esfera de Bloch
7. **Exportar Código**: Generar código Python o Qiskit para tu circuito
8. **Guardar Trabajo**: Almacenar circuitos localmente para uso posterior

### Mejoras Futuras

**Algoritmos Cuánticos**
- Implementar algoritmo de Deutsch-Jozsa
- Agregar algoritmo de búsqueda de Grover
- Protocolo de teletransportación cuántica

**Compuertas Avanzadas**
- Compuerta Toffoli (CCNOT)
- Compuerta SWAP
- Compuertas de rotación paramétricas (Rx, Ry, Rz)
- Compuertas de fase (S, T, fase personalizada)

**Rendimiento**
- Aumentar límite de qubits más allá de 3
- Agregar simulación de ruido

**Compartir y Colaboración**
- Generar enlaces compartibles de circuitos
- Exportar circuitos como imágenes/SVG
- Exportación LaTeX para artículos académicos

### Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios propuestos.

### Agradecimientos

- Curso "Introduction to Quantum Computing" de The Open University
- Documentación de IBM Qiskit para conceptos de computación cuántica
- Comunidades de Three.js y D3.js por las bibliotecas de visualización
```
