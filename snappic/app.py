
import os
import json
import threading
import time
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template, redirect, url_for, send_from_directory

# --- Configuration ---
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB
DATA_FILE = 'data.json'
IMAGE_LIFETIME_SECONDS = 5
FADEOUT_SECONDS = 10
TOTAL_LIFETIME = IMAGE_LIFETIME_SECONDS + FADEOUT_SECONDS
MAX_IMAGES = 10

# --- Flask App Initialization ---
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# --- Helper Functions ---
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_data():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

def cleanup_expired_images():
    """
    Background thread function to clean up expired images.
    """
    while True:
        time.sleep(1)
        data = load_data()
        current_time = datetime.now()
        
        expired_keys = []
        for key, image_data in data.items():
            upload_time = datetime.fromisoformat(image_data['timestamp'])
            if current_time - upload_time > timedelta(seconds=TOTAL_LIFETIME):
                expired_keys.append(key)

        if expired_keys:
            for key in expired_keys:
                try:
                    os.remove(os.path.join(app.config['UPLOAD_FOLDER'], data[key]['filename']))
                    print(f"Deleted expired image: {data[key]['filename']}")
                except OSError as e:
                    print(f"Error deleting file {data[key]['filename']}: {e}")
                del data[key]
            save_data(data)


# --- Flask Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gallery')
def gallery():
    return render_template('gallery.html')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/images', methods=['GET'])
def get_images():
    data = load_data()
    current_time = datetime.now()
    
    active_images = []
    for key, image_data in data.items():
        upload_time = datetime.fromisoformat(image_data['timestamp'])
        age = (current_time - upload_time).total_seconds()
        
        image_data['id'] = key
        image_data['age'] = age
        image_data['lifetime'] = IMAGE_LIFETIME_SECONDS
        image_data['fadeout_duration'] = FADEOUT_SECONDS
        
        active_images.append(image_data)
        
    # Sort by timestamp, newest first
    active_images.sort(key=lambda x: x['timestamp'], reverse=True)
    return jsonify(active_images)


@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return "No image part", 400
    file = request.files['image']
    comment = request.form.get('comment', '')

    if file.filename == '':
        return "No selected file", 400
    
    if len(comment) > 100:
        return "Comment is too long", 400

    if file and allowed_file(file.filename):
        # Sanitize filename
        timestamp = datetime.now().isoformat().replace(":", "-").replace(".", "-")
        extension = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{timestamp}.{extension}"
        
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        data = load_data()
        
        # Enforce FIFO capacity limit
        if len(data) >= MAX_IMAGES:
            # Sort by timestamp to find the oldest
            oldest_key = sorted(data.items(), key=lambda item: item[1]['timestamp'])[0][0]
            try:
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], data[oldest_key]['filename']))
                print(f"Removed oldest image to make space: {data[oldest_key]['filename']}")
            except OSError as e:
                print(f"Error deleting oldest file {data[oldest_key]['filename']}: {e}")
            del data[oldest_key]

        # Add new image data
        image_id = filename.split('.')[0]
        data[image_id] = {
            'filename': filename,
            'comment': comment,
            'timestamp': datetime.now().isoformat()
        }
        save_data(data)

        return redirect(url_for('gallery'))

    return "Invalid file type", 400

# --- Main Execution ---
if __name__ == '__main__':
    # Create upload folder if it doesn't exist
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    
    # Start the background cleanup thread
    cleanup_thread = threading.Thread(target=cleanup_expired_images, daemon=True)
    cleanup_thread.start()
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
