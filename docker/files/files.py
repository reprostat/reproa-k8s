from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pathlib import Path

# Define storage folder using pathlib
STORAGE_FOLDER = Path('storage')

# Ensure storage folder exists
STORAGE_FOLDER.mkdir(parents=True, exist_ok=True)

# Allowed file extensions (optional, can add checks)
ALLOWED_EXTENSIONS = {'.m', '.xml', # workflow
                      '.nii', '.gz' ,'.json', '.tsv'} # data

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

@app.route('/clear', methods=['DELETE'])
def clear_storage():
    try:
        # Walk through the storage folder and list all files
        # Delete everything reachable from the storage directory.
        for root, dirs, files in STORAGE_FOLDER.walk(top_down=False):
            for name in files:
                (root / name).unlink()
            for name in dirs:
                (root / name).rmdir()
        return jsonify({'message': f'Storage {str(STORAGE_FOLDER)} is clear'}), 200
    except Exception as e:
        return jsonify({'message': f'Unable to clear storage {str(STORAGE_FOLDER)} - {str(e)}'}), 500


# Download endpoint
@app.route('/download/<path:filename>', methods=['GET'])
def download_file(filename):
    try:
        # Construct the full file path using pathlib
        file_path = STORAGE_FOLDER / filename
        
        # Use send_from_directory with pathlib's parts
        return send_file(str(file_path), as_attachment=True)
    except FileNotFoundError:
        return jsonify({'message': f'File {filename} not found'}), 404

# Endpoint to list the storage folder 
@app.route('/files/', methods=['GET'])
def list_storage():
    return get_folder_contents()

# Endpoint to browse the folders
@app.route('/files/<path:folder_path>', methods=['GET'])
def get_folder_contents(folder_path=""):
    full_path = STORAGE_FOLDER / folder_path

    if full_path.exists() and full_path.is_dir():
        items = []
        # Iterate through files and folders in the directory
        for item in full_path.iterdir():
            if item.is_dir():
                items.append({"name": item.name, "type": "folder"})
            else:
                items.append({"name": item.name, "type": "file"})
        return jsonify(items)
    else:
        return jsonify({"error": f"Directory {folder_path} not found"}), 404

# Start the Flask server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
