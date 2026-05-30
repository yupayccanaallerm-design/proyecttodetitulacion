import pandas as pd
import numpy as np
import joblib
import os

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier

# =========================
# CARGAR DATASET
# =========================

df = pd.read_csv("../../datasets/infoturistas.csv")

df.columns = df.columns.str.strip()
df = df.fillna("Desconocido")

# =========================
# TARGET
# =========================

TARGET = "Destino"

# SOLO FEATURES IMPORTANTES (🔴 limpieza tipo Netflix)
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

df = df[FEATURES + [TARGET]]

X = df[FEATURES]
y = df[TARGET]

# =========================
# ENCODING
# =========================

encoders = {}

for col in X.columns:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    encoders[col] = le

target_encoder = LabelEncoder()
y = target_encoder.fit_transform(y.astype(str))

# =========================
# SPLIT
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# =========================
# MODELO TIPO NETFLIX
# =========================

model = RandomForestClassifier(
    n_estimators=400,
    max_depth=20,
    min_samples_leaf=1,
    random_state=42
)

model.fit(X_train, y_train)

# =========================
# FUNCIÓN RECOMENDADOR (TOP K)
# =========================

def recommend_top_k(model, X_input, k=5):
    probs = model.predict_proba(X_input)[0]
    top_k_idx = np.argsort(probs)[::-1][:k]

    return [
        {
            "destino": target_encoder.inverse_transform([i])[0],
            "score": float(probs[i])
        }
        for i in top_k_idx
    ]

# =========================
# GUARDAR MODELO
# =========================

os.makedirs("../../trained_models", exist_ok=True)

joblib.dump(model, "../../trained_models/modelo.pkl")
joblib.dump(encoders, "../../trained_models/encoders.pkl")
joblib.dump(target_encoder, "../../trained_models/target_encoder.pkl")

print("Modelo entrenado y guardado correctamente")