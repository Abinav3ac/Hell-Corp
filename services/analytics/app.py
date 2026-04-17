import os
import subprocess
import pickle
import base64
from flask import Flask, request, render_template_string, jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_secret')

# FLAG: HC{t3mpl4t3_m4g1c_99} - Shared via Env Var

@app.route('/')
def index():
    return jsonify({
        "service": "Hellcorp Predictive Analytics Engine",
        "version": "v1.4.2",
        "status": "operational",
        "endpoints": ["/api/predict", "/api/check-node", "/api/report-render"]
    })

# VULN: SSTI (Server-Side Template Injection) via 'name' or 'template' parameter
@app.route('/api/report-render', methods=['GET', 'POST'])
def report_render():
    template = request.values.get('template', 'Hello {{ name }}')
    name = request.values.get('name', 'Analyst')
    
    # Intentionally insecure template rendering
    try:
        # User influences the template string directly
        rendered = render_template_string(template, name=name)
        return rendered
    except Exception as e:
        return str(e), 500

# VULN: OS Command Injection via 'host' parameter
@app.route('/api/check-node', methods=['GET'])
def check_node():
    host = request.args.get('host', '8.8.8.8')
    # Intentionally insecure subprocess call
    try:
        # Example of dynamic command building
        output = subprocess.check_output(f"ping -c 1 {host}", shell=True, stderr=subprocess.STDOUT)
        return jsonify({"status": "up", "node": host, "output": output.decode()})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# VULN: Insecure Deserialization (Pickle) via 'data' parameter
@app.route('/api/predict', methods=['POST'])
def predict():
    auth_data = request.headers.get('X-Analytics-Auth')
    if not auth_data:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        # Base64 decode and pickle load
        decoded = base64.b64decode(auth_data)
        data = pickle.loads(decoded)
        # Process data...
        return jsonify({"prediction": "Successful", "processed_data": str(data)})
    except Exception as e:
        return jsonify({"error": "Processing error", "details": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)
