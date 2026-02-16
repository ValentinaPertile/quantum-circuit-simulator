"""
Simple HTTP server without Flask dependency.
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

# Add src directory to path
src_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, src_dir)

# Now import our modules
try:
    from circuit import QuantumCircuit, create_bell_state
    import numpy as np
    print("Modules imported successfully")
except ImportError as e:
    print(f"Import error: {e}")
    print(f"Python path: {sys.path}")
    sys.exit(1)


class QuantumAPIHandler(BaseHTTPRequestHandler):
    
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_headers()
    
    def do_GET(self):
        if self.path == '/api/health':
            self._set_headers()
            response = {'status': 'ok', 'message': 'Quantum Circuit API is running'}
            self.wfile.write(json.dumps(response).encode())
        
        elif self.path.startswith('/api/presets/'):
            preset_name = self.path.split('/')[-1]
            try:
                if preset_name == 'bell':
                    circuit = create_bell_state('00')
                    amplitudes = circuit.get_amplitudes()
                    
                    amp_data = {}
                    for state, amp in amplitudes.items():
                        amp_data[state] = {
                            'real': float(np.real(amp)),
                            'imag': float(np.imag(amp)),
                            'magnitude': float(np.abs(amp)),
                            'probability': float(np.abs(amp) ** 2)
                        }
                    
                    entanglement_data = circuit.analyze_entanglement()
                    entanglement_data = {
                        'is_entangled': bool(entanglement_data['is_entangled']),
                        'entropy': float(entanglement_data['entropy']),
                        'concurrence': float(entanglement_data['concurrence']),
                        'classification': str(entanglement_data['classification'])
                    }
                    
                    self._set_headers()
                    response = {
                        'success': True,
                        'amplitudes': amp_data,
                        'operations': circuit.get_operations(),
                        'entanglement': entanglement_data
                    }
                    self.wfile.write(json.dumps(response).encode())
                else:
                    self._set_headers(404)
                    self.wfile.write(json.dumps({'success': False, 'error': 'Unknown preset'}).encode())
            except Exception as e:
                print(f"Error in preset: {e}")
                import traceback
                traceback.print_exc()
                self._set_headers(400)
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def do_POST(self):
        if self.path == '/api/simulate':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode())
                
                print(f"Received simulation request: {data}")
                
                num_qubits = data.get('num_qubits', 2)
                operations = data.get('operations', [])
                
                circuit = QuantumCircuit(num_qubits)
                
                for op in operations:
                    gate = op.get('gate', '').lower()
                    
                    if gate == 'h':
                        circuit.h(op['target'])
                    elif gate == 'x':
                        circuit.x(op['target'])
                    elif gate == 'y':
                        circuit.y(op['target'])
                    elif gate == 'z':
                        circuit.z(op['target'])
                    elif gate == 'cnot' or gate == 'cx':
                        circuit.cnot(op['control'], op['target'])
                
                amplitudes = circuit.get_amplitudes()
                
                amp_data = {}
                for state, amp in amplitudes.items():
                    amp_data[state] = {
                        'real': float(np.real(amp)),
                        'imag': float(np.imag(amp)),
                        'magnitude': float(np.abs(amp)),
                        'probability': float(np.abs(amp) ** 2)
                    }
                
                entanglement_data = None
                if num_qubits == 2:
                    try:
                        ent_result = circuit.analyze_entanglement()
                        # Convert all numpy types to Python native types
                        entanglement_data = {
                            'is_entangled': bool(ent_result['is_entangled']),
                            'entropy': float(ent_result['entropy']),
                            'concurrence': float(ent_result['concurrence']),
                            'classification': str(ent_result['classification'])
                        }
                    except Exception as e:
                        print(f"Entanglement error: {e}")
                        import traceback
                        traceback.print_exc()
                
                self._set_headers()
                response = {
                    'success': True,
                    'amplitudes': amp_data,
                    'operations': circuit.get_operations(),
                    'entanglement': entanglement_data
                }
                self.wfile.write(json.dumps(response).encode())
                print("Simulation completed successfully")
                
            except Exception as e:
                print(f"Error in simulate: {e}")
                import traceback
                traceback.print_exc()
                self._set_headers(400)
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")


def run_server(port=5000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, QuantumAPIHandler)
    print(f'Quantum Circuit API Server running on http://127.0.0.1:{port}')
    print(f'Health check: http://127.0.0.1:{port}/api/health')
    print(f'Press Ctrl+C to stop the server\n')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
        print('\nServer stopped')


if __name__ == '__main__':
    print("Starting Quantum Circuit API Server...")
    print(f"Current directory: {os.getcwd()}")
    print(f"Script location: {os.path.abspath(__file__)}")
    
    try:
        run_server()
    except Exception as e:
        print(f"Server error: {e}")
        import traceback
        traceback.print_exc()