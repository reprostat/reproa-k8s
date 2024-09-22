from flask import Flask, jsonify
from os import chdir
from pathlib import Path
import tarfile
import time

# Directory to monitor (using Path from pathlib)
storage_root = Path("/app/storage")
chdir(storage_root)

# Set up the Flask app
app = Flask(__name__)

def process_data(project_dir=""):
    wdir = storage_root / project_dir
    tar_file = wdir.with_suffix('.tar.gz')
    with tarfile.open(tar_file, 'w') as tar: tar.add(wdir.name)
    time.sleep(10)  # Simulate a delay for processing
    tar_file = tar_file.rename(wdir / tar_file.name)
    return str(tar_file)

@app.route('/process-data/<path:folder_path>', methods=['POST'])
def trigger_processing(folder_path=""):
    """
    API endpoint to trigger file processing.
    """
    if not (storage_root / folder_path).exists():
        return jsonify({'message': f'Project "{folder_path}" not found!'}), 404

    result_file = process_data(folder_path)
    
    if result_file:
        return jsonify({'message': 'Processing complete.', 'file': result_file[len(str(storage_root))+1:]}), 200
    else:
        return jsonify({'message': 'No files to process!'}), 200

# Start the Flask app
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8001)