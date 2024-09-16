from flask import Flask, jsonify
from pathlib import Path
import tarfile
import time

# Directory to monitor (using Path from pathlib)
directory_to_watch = Path("/app/storage")

# Set up the Flask app
app = Flask(__name__)

def process_files():
    wdir = list(directory_to_watch.glob('*'))[0]
    tar_file = wdir.with_suffix('.tar.gz')
    with tarfile.open(tar_file) as tar: tar.add(wdir)
    time.sleep(10)  # Simulate a delay for processing
    return tar_file

@app.route('/process-files', methods=['POST'])
def trigger_processing():
    """
    API endpoint to trigger file processing.
    """
    if not directory_to_watch.exists():
        return jsonify({'message': 'Directory not found!'}), 404

    processed_files = process_files()
    
    if processed_files:
        return jsonify({'message': 'Processing complete', 'files': processed_files}), 200
    else:
        return jsonify({'message': 'No files to process'}), 200

# Start the Flask app
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8001)