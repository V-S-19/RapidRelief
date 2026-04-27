# model.py
import numpy as np
# from your_model import load_model, predict  # YOLO, TensorFlow, PyTorch, etc.
from fastapi import FastAPI
from pydantic import BaseModel
from model import detect_emergency
import os
import uvicorn

app = FastAPI()

class FrameData(BaseModel):
    image: str

@app.get("/")
def home():
    return {"message": "AI Service Running ✅"}

@app.post("/analyze")
def analyze(data: FrameData):
    try:
        if not data.image:
            return {
                "alert": {
                    "status": "error",
                    "confidence": 0.0
                },
                "message": "No image provided"
            }
        
        result = detect_emergency(data.image)

        return {
            "alert": {
                "status": result["status"],
                "confidence": result["confidence"]
            },
            "message": result["message"]
        }
    except Exception as e:
        return {
            "alert": {
                "status": "error",
                "confidence": 0.0
            },
            "message": f"Analysis error: {str(e)}"
        }

# 🔥 IMPORTANT: this starts the server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)

