import os
import replicate
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(__file__)
INPUT_DIR = os.path.join(BASE_DIR, "input")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")

os.makedirs(OUTPUT_DIR, exist_ok=True)


def generate_output(prompt: str, input_filename: str):
    input_path = os.path.join(INPUT_DIR, input_filename)

    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")

    with open(input_path, "rb") as image_file:
        input_data = {
            "image": image_file,
            "prompt": prompt
        }

        print(f"Running model with prompt: '{prompt}' on image: {input_filename}")
        output = replicate.run(
            "jagilley/controlnet-pose:0304f7f774ba7341ef754231f794b1ba3d129e3c46af3022241325ae0c50fb99",
            input=input_data
        )

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_paths = []

        for index, item in enumerate(output):
            filename = f"output_{timestamp}_{index}.png"
            output_path = os.path.join(OUTPUT_DIR, filename)
            with open(output_path, "wb") as file:
                file.write(item.read())
            output_paths.append(output_path)
            print(f"Saved: {output_path}")


if __name__ == "__main__":
    # You can change the prompt and file name here
    prompt_text = "Hyperrealistic detail, good lighting, natural color, cinematic, pirate captain"
    input_file = "input_pose2.jpg"

    try:
        generate_output(prompt_text, input_file)
    except Exception as e:
        print(f"Error: {e}")
