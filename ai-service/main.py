from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import analyze_image
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RapidRelief AI Service")

# Better CORS - change "*" to your frontend URL in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # ← Change to ["http://localhost:3000", "http://127.0.0.1:5173"] etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageRequest(BaseModel):
    image: str   # base64 string

@app.get("/")
def home():
    return {"message": "AI Service Running 🚀"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze(request: ImageRequest):   # ← Changed to async
    try:
        if not request.image:
            raise HTTPException(status_code=400, detail="No image provided")

        result = analyze_image(request.image)

        return {
            "alert": {
                "status": result["status"],
                "confidence": result["confidence"]
            },
            "message": result["message"]
        }
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail="Image processing failed. Image may be too large or corrupted.")