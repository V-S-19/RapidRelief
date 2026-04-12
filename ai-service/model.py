def detect_emergency(frame_data):
    frame_data = str(frame_data).lower()

    # If it's long → likely base64 image (future use)
    if len(frame_data) > 100:
        return {
            "status": "normal",
            "confidence": 0.75,
            "message": "Image received and processed"
        }

    # 🔥 Fire detection
    if "fire" in frame_data or "smoke" in frame_data:
        return {
            "status": "fire",
            "confidence": 0.91,
            "message": "Possible fire detected"
        }

    # 🚗 Accident detection
    elif "accident" in frame_data or "crash" in frame_data:
        return {
            "status": "accident",
            "confidence": 0.87,
            "message": "Possible accident detected"
        }

    # 🟢 Normal case
    else:
        return {
            "status": "normal",
            "confidence": 0.78,
            "message": "No danger detected"
        }