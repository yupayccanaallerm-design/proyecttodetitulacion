import pandas as pd
import numpy as np
import joblib
import os
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# =========================
# 1. CARGAR DATASET
# =========================

BASE_DIR = Path(__file__).resolve().parent

csv_path = BASE_DIR.parent.parent / "datasets" / "infoturistas.csv"

print(f"Buscando dataset en: {csv_path}")

if not csv_path.exists():
    raise FileNotFoundError(f"No se encontró el archivo: {csv_path}")

df = pd.read_csv(csv_path)

df.columns = df.columns.str.strip()

for col in df.select_dtypes(include=["object"]).columns:
    df[col] = df[col].astype(str).str.strip()

df = df.fillna("Desconocido")
# =========================
# 2. SELECCIÓN DE FEATURES
# =========================
TARGET = "Destino"

FEATURES = [
    "Edad", "País / Procedencia", "Idioma", "Presupuesto", "Días de viaje", "Tipo de viaje",
    "Problemas respiratorios", "Movilidad reducida", "Alergias", "Apto para adulto mayor", "Apto para niños",
    "Comida", "Naturaleza", "Historia", "Fotografía", "Trekking",
    "Nivel de dificultad", "Requiere caminata", "Altura máxima tolerada"
]

# Crear columnas faltantes con valores por defecto seguros
for col in FEATURES:
    if col not in df.columns:
        if col in ["Edad", "Días de viaje", "Altura máxima tolerada"]:
            df[col] = 0
        elif col in ["Nivel de dificultad", "Presupuesto"]:
            df[col] = "Medio"
        else:
            df[col] = "No"

# === 🔴 EXTRAER ALTURAS REALES DE LOS DESTINOS ANTES DEL ENCODING ===
# Esto crea un diccionario con la altura real de cada destino basándose en el promedio del dataset
if "Altura máxima tolerada" in df.columns:
    # Agrupamos por destino y sacamos la altura promedio histórica asignada a ese destino
    altura_destinos_dict = df.groupby(TARGET)["Altura máxima tolerada"].median().to_dict()
else:
    altura_destinos_dict = {}

df = df[FEATURES + [TARGET]]

X = df[FEATURES].copy()
y = df[TARGET].copy()

# =========================
# 3. ENCODING NUMÉRICO ESTABLE
# =========================
mapeo_si_no = {"No": 0, "Sí": 1, "SI": 1, "NO": 0, "Desconocido": 0}
mapeo_escala = {"Bajo": 0, "Medio": 1, "Alto": 2, "Desconocido": 1}

columnas_si_no = [
    "Problemas respiratorios", "Movilidad reducida", "Alergias", 
    "Apto para adulto mayor", "Apto para niños", "Comida", 
    "Naturaleza", "Historia", "Fotografía", "Trekking", "Requiere caminata"
]

for col in columnas_si_no:
    X[col] = X[col].astype(str).map(mapeo_si_no).fillna(0).astype(int)

X["Nivel de dificultad"] = X["Nivel de dificultad"].astype(str).map(mapeo_escala).fillna(1).astype(int)
X["Presupuesto"] = X["Presupuesto"].astype(str).map(mapeo_escala).fillna(1).astype(int)

# VARIABLES NUMÉRICAS REALES (NO USAR LABEL ENCODER AQUÍ)
X["Edad"] = pd.to_numeric(X["Edad"], errors='coerce').fillna(25).astype(int)
X["Días de viaje"] = pd.to_numeric(X["Días de viaje"], errors='coerce').fillna(5).astype(int)
X["Altura máxima tolerada"] = pd.to_numeric(X["Altura máxima tolerada"], errors='coerce').fillna(3500).astype(int)

# Encoders para las variables categóricas de texto abierto
encoders = {}
columnas_categoricas = ["País / Procedencia", "Idioma", "Tipo de viaje"]
for col in columnas_categoricas:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    encoders[col] = le

target_encoder = LabelEncoder()
y = target_encoder.fit_transform(y.astype(str))

# =========================
# 4. SPLIT Y ENTRENAMIENTO
# =========================
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(
    n_estimators=500,
    max_depth=12,         # Reducido un poco para evitar que memorice ruido
    min_samples_leaf=3,   # Mayor generalización para respetar los cortes físicos
    random_state=42
)
model.fit(X_train, y_train)

# =========================
# 5. FUNCIÓN TOP K CON FILTRO DE SEGURIDAD FÍSICA
# =========================
def recommend_top_k(model, X_input, k=5):
    """
    X_input: DataFrame o array con 1 fila de datos numéricos mapeados.
    """
    # Obtener probabilidades del modelo de IA
    probs = model.predict_proba(X_input)[0]
    
    # Extraer las variables de control que ingresó el usuario en el frontend
    # Recordar la posición de las columnas o usar nombres si X_input es DataFrame
    if isinstance(X_input, pd.DataFrame):
        altura_usuario = X_input["Altura máxima tolerada"].values[0]
        requiere_caminata_usuario = X_input["Requiere caminata"].values[0]
        trekking_usuario = X_input["Trekking"].values[0]
    else:
        # Índices basados en la lista FEATURES si es un array plano numpy
        altura_usuario = X_input[0][-1]
        requiere_caminata_usuario = X_input[0][FEATURES.index("Requiere caminata")]
        trekking_usuario = X_input[0][FEATURES.index("Trekking")]

    RECOMENDACIONES = []
    
    for idx, prob in enumerate(probs):
        destino_nombre = target_encoder.inverse_transform([idx])[0]
        
        # Obtener la altura real estimada para este destino turistico
        # Si el destino no tiene registro, asumimos un valor neutro
        altura_real_destino = altura_destinos_dict.get(destino_nombre, 3400)
        
        # --- FILTROS DUROS DE CONTROL Y SEGURIDAD MEDICA ---
        # 1. Si el usuario tolera hasta 2500m y Salkantay está a ~4600m, su probabilidad cae a cero.
        if altura_usuario < altura_real_destino:
            prob = 0.0
            
        # 2. Si el usuario especificó que NO quiere caminata ni Trekking, penalizamos rutas agrestes
        if (requiere_caminata_usuario == 0 or trekking_usuario == 0) and ("trekking" in destino_nombre.lower() or "caminata" in destino_nombre.lower() or "nevado" in destino_nombre.lower() or "salkantay" in destino_nombre.lower()):
            prob = 0.0

        RECOMENDACIONES.append({
            "destino": destino_nombre,
            "score": float(prob)
        })

    # Ordenar de mayor a menor probabilidad y truncar al Top K deseado
    RECOMENDACIONES = sorted(RECOMENDACIONES, key=lambda x: x["score"], reverse=True)
    
    # Retornar sólo aquellos con probabilidad mayor a cero
    resultados_validos = [r for r in RECOMENDACIONES if r["score"] > 0]
    
    # Si los filtros duros vaciaron la lista, enviamos opciones seguras por defecto (Ej: Ciudad de Cusco o Museos)
    if not resultados_validos:
        return [{"destino": "Centro Histórico de Cusco (City Tour o Museos)", "score": 1.0}]
        
    return resultados_validos[:k]

# =========================
# 6. EXPORTAR ARTIFACTOS
# =========================

MODELS_DIR = BASE_DIR.parent.parent / "trained_models"

MODELS_DIR.mkdir(parents=True, exist_ok=True)

joblib.dump(model, MODELS_DIR / "modelo.pkl")
joblib.dump(encoders, MODELS_DIR / "encoders.pkl")
joblib.dump(target_encoder, MODELS_DIR / "target_encoder.pkl")
joblib.dump(altura_destinos_dict, MODELS_DIR / "altura_destinos.pkl")

print("¡Modelo calibrado con éxito!")
print(f"Modelos guardados en: {MODELS_DIR}")