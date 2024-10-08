from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from pathlib import Path

# Define storage folder using pathlib
STORAGE_FOLDER = Path('/app/storage')

# Ensure storage folder exists
STORAGE_FOLDER.mkdir(parents=True, exist_ok=True)

# Allowed file extensions (optional, can add checks)
ALLOWED_EXTENSIONS = {'', # unspecified (e.g., for README)
                      '.m', '.xml', # workflow
                      '.nii', '.gz' ,'.json', '.tsv'} # data

# Create Flask app
app = Flask(__name__)

# Folder creation endpoint
@app.route('/mkdir/<path:folder_path>', methods=['POST'])
def make_folder(folder_path=""):
    new_folder = STORAGE_FOLDER / folder_path
    try:
        new_folder.mkdir(parents=True, exist_ok=True)
        return jsonify({'message': f'Folder {str(new_folder)} created successfully', 'folder': str(new_folder)}), 200
    except Exception as e:
        return jsonify({'message': f'Unable clear folder {str(new_folder)} - {str(e)}'}), 500

# Upload endpoint - allows folder upload by handling multiple files
@app.route('/upload/<path:folder_path>', methods=['POST'])
def upload_files(folder_path=""):
    # Check if files were uploaded (allow suffix)
    if not("files" in request.files.keys()):
        return jsonify({'message': f'No "files" in the request with {request.files.keys()}'}), 400
    
    # Get the list of files
    files = request.files.getlist("files")
    
    if not files:
        return jsonify({'message': 'No files selected'}), 400

    # Process each file
    saved_files = []
    skipped_files = []
    for file in files:
        if Path(file.filename).suffix in ALLOWED_EXTENSIONS:
            # Secure the filename and construct the full file path using pathlib
            full_filename = Path(file.filename)
            full_filename = full_filename.with_name(secure_filename(full_filename.name))
            file_path = STORAGE_FOLDER / folder_path / Path(*full_filename.parts[1:])
            
            # Create parent directories if necessary
            file_path.parent.mkdir(parents=True, exist_ok=True)

            # Save the file
            file.save(file_path)
            saved_files.append(str(file_path.relative_to(STORAGE_FOLDER)))
        else:
            skipped_files.append(file.filename)
    if len(skipped_files):
        return jsonify({'message': f'File type not allowed for {len(skipped_files)} file(s)', 'files': skipped_files}), 400
    else:
        return jsonify({'message': f'{len(saved_files)} file(s) uploaded successfully', 'files': saved_files}), 200

@app.route('/clear/<path:folder_path>', methods=['DELETE'])
def clear_storage(folder_path=""):
    try:
        # Walk through the storage folder and list all files
        # Delete everything reachable from the storage directory.
        for root, dirs, files in (STORAGE_FOLDER / folder_path).walk(top_down=False):
            for name in files:
                (root / name).unlink()
            for name in dirs:
                (root / name).rmdir()
        if folder_path: (STORAGE_FOLDER / folder_path).rmdir()
        return jsonify({'message': f'Project {str(folder_path)} is clear'}), 200
    except Exception as e:
        return jsonify({'message': f'Unable to clear project {str(folder_path)} - {str(e)}'}), 500


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
