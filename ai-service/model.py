import base64
import numpy as np
import cv2
import logging

logger = logging.getLogger(__name__)

def decode_image(image_data: str):
    try:
        if not image_data:
            return None

        # Test mode
        if image_data.strip() == "test":
            return "test"

        # Remove data:image/...;base64, prefix if present
        if "," in image_data:
            image_data = image_data.split(",")[1]

        # Decode base64
        image_bytes = base64.b64decode(image_data)

        # Convert to numpy array and decode with OpenCV
        np_arr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            logger.warning("Failed to decode image with OpenCV")
            return None

        # Optional: resize very large images to prevent memory explosion
        max_dim = 1200
        height, width = image.shape[:2]
        if max(height, width) > max_dim:
            scale = max_dim / max(height, width)
            new_size = (int(width * scale), int(height * scale))
            image = cv2.resize(image, new_size, interpolation=cv2.INTER_AREA)
            logger.info(f"Resized image to {new_size}")

        return image

    except Exception as e:
        logger.error(f"Image decode error: {e}")
        return None


def detect_fire(image):
    if image is None:
        return 0.0

    try:
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

        # Improved fire/smoke detection ranges (you can tune these)
        lower_fire = np.array([0, 120, 200])
        upper_fire = np.array([35, 255, 255])

        mask = cv2.inRange(hsv, lower_fire, upper_fire)

        fire_pixels = cv2.countNonZero(mask)
        total_pixels = image.shape[0] * image.shape[1]

        if total_pixels == 0:
            return 0.0

        return fire_pixels / total_pixels
    except Exception as e:
        logger.error(f"Fire detection error: {e}")
        return 0.0

def detect_accident(image):
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        edges = cv2.Canny(gray, 100, 200)

        edge_pixels = cv2.countNonZero(edges)
        total_pixels = image.shape[0] * image.shape[1]

        if total_pixels == 0:
            return 0.0

        return edge_pixels / total_pixels
    except Exception as e:
        logger.error(f"Accident detection error: {e}")
        return 0.0
    
def analyze_image(image_data: str):
    image = decode_image(image_data)

    if isinstance(image, str) and image == "test":
        return {
            "status": "fire",
            "confidence": 0.95,
            "message": "Fire detected (test mode)"
        }

    if image is None:
        return {
            "status": "unknown",
            "confidence": 0.0,
            "message": "Invalid or corrupted image"
        }

    fire_ratio = detect_fire(image)
    accident_ratio = detect_accident(image)

    logger.info(f"Fire ratio: {fire_ratio}, Accident ratio: {accident_ratio}")

    if fire_ratio > 0.15:
        return {
            "status": "fire",
            "confidence": round(min(fire_ratio * 3, 1.0), 2),
            "message": "Fire detected"
        }

    elif accident_ratio > 0.25:
        return {
            "status": "accident",
            "confidence": round(min(accident_ratio * 2, 1.0), 2),
            "message": "Possible accident detected"
        }

    else:
        return {
            "status": "safe",
            "confidence": 0.95,
            "message": "No danger detected"
        }