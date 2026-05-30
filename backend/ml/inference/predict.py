import joblib
import pandas as pd
import os

# =========================
# RUTAS
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

ruta_modelos = os.path.join(
    BASE_DIR,
    "..",
    "trained_models"
)

# =========================
# CARGAR MODELOS
# =========================

modelo = joblib.load(
    os.path.join(
        ruta_modelos,
        "recomendador_turismo.pkl"
    )
)

encoders = joblib.load(
    os.path.join(
        ruta_modelos,
        "encoders.pkl"
    )
)

target_encoder = joblib.load(
    os.path.join(
        ruta_modelos,
        "target_encoder.pkl"
    )
)

# =========================
# DATOS DEL USUARIO
# =========================

usuario = {
    "Edad": 24,
    "País / Procedencia": "Perú",
    "Idioma": "Español",
    "Presupuesto": "Medio",
    "Días de viaje": 5,
    "Tipo de viaje": "Cultural",
    "Problemas respiratorios": "No",
    "Movilidad reducida": "No",
    "Alergias": "No",
    "Comida": "Sí",
    "Naturaleza": "Sí",
    "Historia": "Sí",
    "Fotografía": "Sí",
    "Destino alternativo": "Montaña de 7 Colores",
    "Nivel de dificultad": "Medio",
    "Requiere caminata": "Sí",
    "Altura máxima tolerada": 3400,
    "Recomendación médica": "No",
    "Tipo de transporte": "Tren",
    "Tour recomendado": "2D1N",
    "Riesgo por altura": "Medio",
    "Apto para adulto mayor": "Sí",
    "Apto para niños": "Sí"
}

# =========================
# CONVERTIR A DATAFRAME
# =========================

df_usuario = pd.DataFrame([usuario])

# =========================
# CODIFICAR DATOS
# =========================

for column in df_usuario.columns:

    if column in encoders:

        le = encoders[column]

        df_usuario[column] = le.transform(
            df_usuario[column].astype(str)
        )

# =========================
# HACER PREDICCIÓN
# =========================

prediccion = modelo.predict(df_usuario)

resultado = target_encoder.inverse_transform(prediccion)

# =========================
# RESULTADO
# =========================

print("Destino recomendado:")

print(resultado[0])