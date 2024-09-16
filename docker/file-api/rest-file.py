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

# Upload endpoint - allows folder upload by handling multiple files
@app.route('/upload', methods=['POST'])
def upload_files():
    # Check if files were uploaded
    if 'files[]' not in request.files:
        return jsonify({'message': 'No files part in the request'}), 400
    
    # Get the list of files
    files = request.files.getlist('files[]')
    
    if not files:
        return jsonify({'message': 'No files selected'}), 400

    # Process each file
    saved_files = []
    for file in files:
        if file and allowed_file(file.filename):
            # Extract folder path if the browser sends it (Chrome/Edge provide folder path info in file.filename)
            full_filename = secure_filename(file.filename)
            subfolder = os.path.dirname(full_filename)  # Get the folder path

            # Create subfolder if it doesn't exist
            folder_path = os.path.join(STORAGE_FOLDER, subfolder)
            if not os.path.exists(folder_path):
                os.makedirs(folder_path)

            # Save the file inside the folder
            file.save(os.path.join(folder_path, os.path.basename(full_filename)))
            saved_files.append(full_filename)
        else:
            return jsonify({'message': 'File type not allowed', 'file': file.filename}), 400
    
    return jsonify({'message': 'Files uploaded successfully', 'files': saved_files}), 200

# Download endpoint
@app.route('/download/<path:filename>', methods=['GET'])
def download_file(filename):
    try:
        return send_from_directory(STORAGE_FOLDER, filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({'message': f'File {filename} not found'}), 404

# List files endpoint
@app.route('/files', methods=['GET'])
def list_files():
    try:
        files = []
        for root, dirs, file_list in os.walk(STORAGE_FOLDER):
            for file in file_list:
                # Append relative path of the file to the list
                files.append(os.path.relpath(os.path.join(root, file), STORAGE_FOLDER))
        return jsonify(files), 200
    except Exception as e:
        return jsonify({'message': f'Unable to scan directory: {str(e)}'}), 500

# Start the Flask server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
