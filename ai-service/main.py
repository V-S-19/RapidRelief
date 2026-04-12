from fastapi import FastAPI
from pydantic import BaseModel
from model import detect_emergency

app = FastAPI()

class FrameData(BaseModel):
    image: str

@app.get("/")
def home():
    try:
        return {"message": "AI Service Running"}
    except Exception as e:
        return {"error": str(e), "message": "Service error"}

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