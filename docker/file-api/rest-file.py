from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pathlib import Path

# Define storage folder using pathlib
STORAGE_FOLDER = Path('storage')

# Ensure storage folder exists
STORAGE_FOLDER.mkdir(parents=True, exist_ok=True)

# Allowed file extensions (optional, can add checks)
ALLOWED_EXTENSIONS = {'.m', '.xml', # workflow
                      '.json',
                      '.txt', '.pdf', '.png', '.jpg', '.gif'} # report

# Create Flask app
app = Flask(__name__)
CORS(app)

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
        if Path(file.filename).suffix in ALLOWED_EXTENSIONS:
            # Secure the filename and construct the full file path using pathlib
            full_filename = Path(file.filename)
            full_filename = full_filename.with_name(secure_filename(full_filename.name))
            file_path = STORAGE_FOLDER / full_filename
            
            # Create parent directories if necessary
            file_path.parent.mkdir(parents=True, exist_ok=True)

            # Save the file
            file.save(file_path)
            saved_files.append(str(file_path.relative_to(STORAGE_FOLDER)))
        else:
            return jsonify({'message': f'File type not allowed for file: {file.filename}'}), 400
    
    return jsonify({'message': 'Files uploaded successfully', 'files': saved_files}), 200

# Download endpoint
@app.route('/download/<path:filename>', methods=['GET'])
def download_file(filename):
    try:
        # Construct the full file path using pathlib
        file_path = STORAGE_FOLDER / filename
        
        # Use send_from_directory with pathlib's parts
        return send_from_directory(STORAGE_FOLDER, file_path.relative_to(STORAGE_FOLDER), as_attachment=True)
    except FileNotFoundError:
        return jsonify({'message': f'File {filename} not found'}), 404

# List files endpoint
@app.route('/files', methods=['GET'])
def list_files():
    try:
        # Walk through the storage folder and list all files
        files = [str(path.relative_to(STORAGE_FOLDER)) for path in STORAGE_FOLDER.rglob('*') if path.is_file()]
        return jsonify(files), 200
    except Exception as e:
        return jsonify({'message': f'Unable to scan directory: {str(e)}'}), 500

# Start the Flask server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
