from fastapi import APIRouter, HTTPException
import joblib
import pandas as pd
import os

router = APIRouter(
    prefix="/recomendacion",
    tags=["Recomendación"]
)

# ------------------ PATHS ------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )
    )
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "ml",
    "trained_models"
)

# ------------------ CARGAR MODELOS ------------------

try:
    modelo = joblib.load(
        os.path.join(MODEL_DIR, "modelo.pkl")
    )

    encoders = joblib.load(
        os.path.join(MODEL_DIR, "encoders.pkl")
    )

    target_encoder = joblib.load(
        os.path.join(MODEL_DIR, "target_encoder.pkl")
    )

    print("[OK] Modelos cargados correctamente")

except Exception as e:
    print(f"[ERROR] Error cargando modelos: {e}")
    modelo = None
    encoders = None
    target_encoder = None

# ------------------ FEATURES ------------------

FEATURES = [
    "Edad",
    "País / Procedencia",
    "Idioma",
    "Presupuesto",
    "Días de viaje",
    "Tipo de viaje",
    "Naturaleza",
    "Historia",
    "Fotografía",
    "Altura máxima tolerada"
]

# ------------------ RUTAS ------------------

@router.get("/")
def home():
    return {
        "service": "Travel Assistant Recommendation API",
        "status": "ok"
    }


@router.post("/recomendar")
def recomendar(data: dict):

    if modelo is None:
        raise HTTPException(
            status_code=500,
            detail="Los modelos no están cargados."
        )

    try:

        # Validar campos requeridos
        faltantes = [
            campo
            for campo in FEATURES
            if campo not in data
        ]

        if faltantes:
            return {
                "success": False,
                "error": f"Faltan campos: {faltantes}"
            }

        # Mantener exactamente el mismo formato
        input_data = {
            campo: data[campo]
            for campo in FEATURES
        }

        df = pd.DataFrame([input_data])

        # Aplicar encoders
        for col in df.columns:

            if col in encoders:

                df[col] = encoders[col].transform(
                    df[col].astype(str)
                )

        # Predicción
        probs = modelo.predict_proba(df)[0]

        top_k = probs.argsort()[::-1][:5]

        resultados = []

        for i in top_k:

            resultados.append({
                "destino": target_encoder.inverse_transform([i])[0],
                "score": round(float(probs[i]), 4)
            })

        return {
            "success": True,
            "top": resultados
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }