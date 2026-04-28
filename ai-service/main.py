import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
from PIL import Image
import base64
import io
import json

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY is not set! Please add it to your .env file.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI(title="RapidRelief AI Service")

class FrameData(BaseModel):
    image: str   # Expecting base64 encoded image

@app.get("/")
def home():
    return {"message": "AI Service Running ✅", "status": "healthy"}

@app.post("/analyze")
def analyze(data: FrameData):
    try:
        if not data.image:
            return {
                "alert": {"status": "error", "confidence": 0.0},
                "message": "No image provided"
            }
        
        result = detect_emergency(data.image)

        return {
            "alert": {
                "status": result.get("status", "error"),
                "confidence": result.get("confidence", 0.0)
            },
            "message": result.get("message", "Analysis completed")
        }
    except Exception as e:
        return {
            "alert": {"status": "error", "confidence": 0.0},
            "message": f"Analysis error: {str(e)}"
        }


def detect_emergency(base64_image: str) -> dict:
    try:
        image_bytes = base64.b64decode(base64_image)
        image = Image.open(io.BytesIO(image_bytes))

        prompt = """
        You are an emergency detection AI for a safety app called RapidRelief.
        Analyze the image carefully and determine if there is any emergency situation.

        Respond **only** with valid JSON in this exact format (no extra text):

        {
            "status": "emergency" or "normal",
            "confidence": float between 0.0 and 1.0,
            "message": "short clear description of what you see and why"
        }

        Examples of emergencies: fire, car accident, person injured, violence, natural disaster, medical emergency, etc.
        If no emergency, status = "normal" and confidence can be high.
        """

        response = model.generate_content([prompt, image])
        text = response.text.strip()

        if text.startswith("```json"):
            text = text.split("```json")[1].split("```")[0].strip()
        elif text.startswith("```"):
            text = text.split("```")[1].strip()

        result = json.loads(text)
        return result

    except Exception as e:
        print(f"❌ Detection error: {e}")
        return {
            "status": "error",
            "confidence": 0.0,
            "message": "Failed to analyze the image"
        }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)