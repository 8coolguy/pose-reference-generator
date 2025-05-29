# Pose Reference Generator - Backend

This backend service uses the Replicate API to generate pose-based AI imagery using ControlNet. It takes an input image and a prompt, and returns one or more generated output images.

---

## 🚀 Setup Instructions

### 1. Navigate to the Backend Directory

```bash
cd backend
```

---

### 2. Create a Virtual Environment

```bash
python -m venv .venv
```

---

### 3. Activate the Virtual Environment

* **Windows:**

```bash
.venv\Scripts\activate
```

* **macOS/Linux:**

```bash
source .venv/bin/activate
```

---

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 5. Set Up Environment Variables

Create a `.env` file in the `backend` folder with the following content:

```env
REPLICATE_API_TOKEN=your_replicate_api_key_here
```

> 🔑 You can get your API token from [https://replicate.com/account](https://replicate.com/account)

---

## ✅ Running the Script

1. Place your input image inside the `backend/input/` folder (e.g., `input_pose.png`).

2. Run the backend script:

```bash
python main.py
```

This will use the prompt and image defined in the script to generate outputs.

---

## 📷 Output Files

* Outputs are saved in the `backend/outputs/` directory.
* Filenames are timestamped to avoid overwriting:

```
output_20250528_153412_0.png
output_20250528_153412_1.png
```

---

## 💡 Project Structure

```
backend/
├── input/             # Input images
│   └── input_pose.png
├── outputs/           # Output images
├── main.py            # Core backend logic
├── requirements.txt   # Python dependencies
├── .env               # API token configuration
└── README.md          # This file
```

---

## 🛠️ Extending to Flask

This backend is modular and ready to be integrated into a Flask API. You can import the `PoseGenerator` class from `main.py` to add route support for prompts, file uploads, etc.

If you'd like help building the Flask API, let us know!

---

## 🚀 Powered By

* [Replicate](https://replicate.com/)
* [ControlNet](https://github.com/lllyasviel/ControlNet)
* Python 3.9+

---

Happy Generating ✨
