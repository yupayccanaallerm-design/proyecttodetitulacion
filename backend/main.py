from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

modelo = joblib.load("ml/trained_models/modelo.pkl")
encoders = joblib.load("ml/trained_models/encoders.pkl")
target_encoder = joblib.load("ml/trained_models/target_encoder.pkl")


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


@app.get("/")
def home():
    return {"status": "ok"}


@app.post("/recomendar")
def recomendar(data: dict):

    # 🔥 NO RENOMBRAR NADA (usar igual que frontend)
    input_data = {f: data[f] for f in FEATURES}

    df = pd.DataFrame([input_data])

    # encoding correcto
    for col in df.columns:
        if col in encoders:
            df[col] = encoders[col].transform(df[col].astype(str))

    probs = modelo.predict_proba(df)[0]
    top_k = probs.argsort()[::-1][:5]

    return {
        "top": [
            {
                "destino": target_encoder.inverse_transform([i])[0],
                "score": float(probs[i])
            }
            for i in top_k
        ]
    }