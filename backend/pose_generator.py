import os
import replicate
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


class PoseGenerator:
    def __init__(self, input_dir="input", output_dir="outputs"):
        self.base_dir = os.path.dirname(__file__)
        self.input_dir = os.path.join(self.base_dir, input_dir)
        self.output_dir = os.path.join(self.base_dir, output_dir)

        os.makedirs(self.input_dir, exist_ok=True)
        os.makedirs(self.output_dir, exist_ok=True)

        self.replicate = replicate.Client()

    def generate(self, prompt: str, input_filename: str) -> list[str]:
        input_path = os.path.join(self.input_dir, input_filename)

        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input file not found: {input_path}")

        with open(input_path, "rb") as image_file:
            input_data = {
                "image": image_file,
                "prompt": prompt
            }

            print(f"Running model with prompt: '{prompt}' on image: {input_filename}")
            output = self.replicate.run(
                "jagilley/controlnet-pose:0304f7f774ba7341ef754231f794b1ba3d129e3c46af3022241325ae0c50fb99",
                input=input_data
            )

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_paths = []

            for index, item in enumerate(output):
                filename = f"output_{timestamp}_{index}.png"
                output_path = os.path.join(self.output_dir, filename)
                with open(output_path, "wb") as file:
                    file.write(item.read())
                output_paths.append(output_path)
                print(f"Saved: {output_path}")

            return output_paths

    def create_prediction(self, image_path, prompt, webhook_url):
        with open(image_path, "rb") as img:
            prediction = self.replicate.predictions.create(
                version="0304f7f774ba7341ef754231f794b1ba3d129e3c46af3022241325ae0c50fb99",
                input={"image": img, "prompt": prompt},
                webhook=webhook_url,
                webhook_events_filter=["completed"]
            )
        return prediction


if __name__ == "__main__":
    generator = PoseGenerator()
    prompt_text = "Hyperrealistic detail, good lighting, natural color, cinematic, pirate captain"
    input_file = "input_pose2.jpg"

    try:
        generator.generate(prompt_text, input_file)
    except Exception as e:
        print(f"Error: {e}")
