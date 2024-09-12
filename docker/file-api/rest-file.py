from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

# Define storage folder
STORAGE_FOLDER = 'storage'

# Ensure storage folder exists
if not os.path.exists(STORAGE_FOLDER):
    os.makedirs(STORAGE_FOLDER)

# Allowed file extensions (optional, can add checks)
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

# Create Flask app
app = Flask(__name__)
CORS(app)

# Check if file extension is allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Upload endpoint
@app.route('/upload', methods=['POST'])
def upload_file():
    # Check if the request has the file part
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400
    file = request.files['file']
    
    # If user does not select a file
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400
    
    # Save the file if it is valid
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)  # Secure the filename
        file.save(os.path.join(STORAGE_FOLDER, filename))
        return jsonify({'message': 'File uploaded successfully', 'file': filename}), 200
    else:
        return jsonify({'message': 'File type not allowed'}), 400

# Download endpoint
@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        return send_from_directory(STORAGE_FOLDER, filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({'message': f'File {filename} not found'}), 404

# List files endpoint
@app.route('/files', methods=['GET'])
def list_files():
    try:
        files = os.listdir(STORAGE_FOLDER)
        return jsonify(files), 200
    except Exception as e:
        return jsonify({'message': f'Unable to scan directory: {str(e)}'}), 500

# Start the Flask server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
