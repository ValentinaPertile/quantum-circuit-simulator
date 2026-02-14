"""
Simple HTTP server without Flask dependency.
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sys
import os

# Add src to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.circuit import QuantumCircuit, create_bell_state
import numpy as np


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
                    entanglement_data['entropy'] = float(entanglement_data['entropy'])
                    entanglement_data['concurrence'] = float(entanglement_data['concurrence'])
                    
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
                        entanglement_data = circuit.analyze_entanglement()
                        entanglement_data['entropy'] = float(entanglement_data['entropy'])
                        entanglement_data['concurrence'] = float(entanglement_data['concurrence'])
                    except:
                        pass
                
                self._set_headers()
                response = {
                    'success': True,
                    'amplitudes': amp_data,
                    'operations': circuit.get_operations(),
                    'entanglement': entanglement_data
                }
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
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
    httpd.serve_forever()


if __name__ == '__main__':
    try:
        run_server()
    except KeyboardInterrupt:
        print('\n\n Server stopped')