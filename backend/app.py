from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from pose_generator import PoseGenerator
import os

app = Flask(__name__)
generator = PoseGenerator()

@app.route("/generate", methods=["POST"])
def generate():
    prompt = request.form.get("prompt")
    image = request.files.get("image")

    if not prompt or not image:
        return jsonify({"error": "Missing prompt or image"}), 400

    # Secure and save the uploaded image
    filename = secure_filename(image.filename)
    input_path = os.path.join(generator.input_dir, filename)
    image.save(input_path)

    try:
        output_files = generator.generate(prompt, filename)
        return jsonify({"outputs": output_files})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
