import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pose_generator import PoseGenerator

app = Flask(__name__)

# ✅ Enable CORS for all origins (for development)
# For production, replace '*' with your frontend URL
CORS(app, resources={r"/*": {"origins": "*"}})

generator = PoseGenerator()
PREDICTIONS_FILE = "predictions.json"

# In-memory fallback store
prediction_store = {}

def save_prediction_data(prediction_id, data):
    prediction_store[prediction_id] = data
    with open(PREDICTIONS_FILE, "w") as f:
        json.dump(prediction_store, f)

def load_prediction_data():
    if os.path.exists(PREDICTIONS_FILE):
        with open(PREDICTIONS_FILE, "r") as f:
            prediction_store.update(json.load(f))

# Load existing predictions if file exists
load_prediction_data()

@app.route("/generate", methods=["POST"])
def generate():
    prompt = request.form.get("prompt")
    image = request.files.get("image")

    if not prompt or not image:
        return jsonify({"error": "Missing prompt or image"}), 400

    filename = secure_filename(image.filename)
    input_path = os.path.join(generator.input_dir, filename)
    image.save(input_path)

    # Change this to your backend's public URL in production
    webhook_url = "https://pose-reference-generator.onrender.com/webhook"

    try:
        prediction = generator.create_prediction(input_path, prompt, webhook_url)
        save_prediction_data(prediction.id, {
            "status": "starting",
            "outputs": []
        })
        return jsonify({"prediction_id": prediction.id}), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/status/<prediction_id>", methods=["GET"])
def check_status(prediction_id):
    data = prediction_store.get(prediction_id)
    if not data:
        return jsonify({"error": "Prediction ID not found"}), 404
    return jsonify(data), 200

@app.route("/webhook", methods=["POST"])
def webhook():
    payload = request.json
    prediction_id = payload.get("id")
    status = payload.get("status")
    output = payload.get("output", [])

    if prediction_id:
        prediction_store[prediction_id] = {
            "status": status,
            "outputs": output
        }
        with open(PREDICTIONS_FILE, "w") as f:
            json.dump(prediction_store, f)

    return "", 204

if __name__ == "__main__":
    app.run(debug=True)
