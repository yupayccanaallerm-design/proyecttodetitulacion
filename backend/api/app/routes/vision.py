from fastapi import APIRouter, UploadFile, File
from PIL import Image
import tensorflow as tf
import numpy as np
import os

router = APIRouter(
    prefix="/vision",
    tags=["Vision IA"]
)

# ==================================
# PATHS (ROBUSTO)
# ==================================

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../..")
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "reconocedoriamagenes",
    "trained_models"
)

MODEL_PATH = os.path.join(MODEL_DIR, "mejor_modelo.keras")
CLASSES_PATH = os.path.join(MODEL_DIR, "clases.txt")

# ==================================
# VARIABLES GLOBALES SEGURAS
# ==================================

model = None
clases = []

# ==================================
# CARGA SEGURA
# ==================================

def load_model_and_classes():
    global model, clases

    if not os.path.exists(MODEL_PATH):
        print(f"[ERROR] Modelo no encontrado: {MODEL_PATH}")
        return

    if not os.path.exists(CLASSES_PATH):
        print(f"[ERROR] Clases no encontradas: {CLASSES_PATH}")
        return

    try:
        model = tf.keras.models.load_model(MODEL_PATH)

        with open(CLASSES_PATH, "r", encoding="utf-8") as f:
            clases = [line.strip() for line in f if line.strip()]

        print("[OK] Modelo cargado correctamente")
        print(f"[INFO] Clases: {len(clases)}")

    except Exception as e:
        print(f"[ERROR] Error cargando modelo: {e}")


# Cargar modelo al iniciar el modulo
load_model_and_classes()


# ==================================
# PREPROCESAMIENTO
# ==================================

def preprocess_image(image: Image.Image):
    image = image.convert("RGB")
    image = image.resize((224, 224))

    img = np.array(image).astype(np.float32) / 255.0
    img = np.expand_dims(img, axis=0)

    return img


# ==================================
# ENDPOINTS
# ==================================

@router.get("/")
def status():
    return {
        "service": "Vision API",
        "status": "ok" if model else "disabled",
        "classes": len(clases)
    }


@router.post("/predict")
async def predict(file: UploadFile = File(...)):

    if model is None:
        return {
            "success": False,
            "error": "Modelo no cargado"
        }

    try:
        image = Image.open(file.file)
        img = preprocess_image(image)

        prediction = model.predict(img, verbose=0)[0]

        idx = int(np.argmax(prediction))
        confidence = float(prediction[idx])

        top_idx = np.argsort(prediction)[::-1][:5]

        return {
            "success": True,
            "clase": clases[idx] if idx < len(clases) else "unknown",
            "confidence": round(confidence * 100, 2),
            "top_predictions": [
                {
                    "clase": clases[i] if i < len(clases) else "unknown",
                    "score": float(prediction[i])
                }
                for i in top_idx
            ]
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }