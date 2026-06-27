from fastapi import APIRouter, HTTPException
from typing import Any, Dict
import joblib
import numpy as np
import pandas as pd
import os
import traceback
from database import obtener_conexion

router = APIRouter(tags=["Recomendacion"])

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
MODELS_DIR = os.path.join(BASE_DIR, "ml", "trained_models")

FEATURES = [
    "Edad", "País / Procedencia", "Idioma", "Presupuesto", "Días de viaje", "Tipo de viaje",
    "Problemas respiratorios", "Movilidad reducida", "Alergias", "Apto para adulto mayor",
    "Apto para niños", "Comida", "Naturaleza", "Historia", "Fotografía", "Trekking",
    "Nivel de dificultad", "Requiere caminata", "Altura máxima tolerada",
]

model = None
encoders = None
target_encoder = None
altura_destinos = None


def load_models():
    global model, encoders, target_encoder, altura_destinos
    try:
        model = joblib.load(os.path.join(MODELS_DIR, "modelo.pkl"))
        encoders = joblib.load(os.path.join(MODELS_DIR, "encoders.pkl"))
        target_encoder = joblib.load(os.path.join(MODELS_DIR, "target_encoder.pkl"))
        altura_destinos = joblib.load(os.path.join(MODELS_DIR, "altura_destinos.pkl"))
        print("[OK] Modelos de recomendación cargados")
    except Exception as e:
        print(f"[ERROR] No se pudieron cargar los modelos de recomendación: {e}")


# ==================================================
# INICIALIZACIÓN DE TABLAS EN MYSQL
# ==================================================

def _inicializar_tablas():
    """Crea las tablas de recomendaciones si no existen. Se llama al cargar el módulo."""
    conexion = obtener_conexion()
    if not conexion:
        print("[WARN] _inicializar_tablas: no se pudo conectar a la BD")
        return
    cursor = conexion.cursor()
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recomendaciones_ia (
                id                BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
                reserva_id        INT             NULL,
                cliente_id        BIGINT          NULL,
                edad              INT             NULL,
                pais_procedencia  VARCHAR(100)    NULL,
                viaja_con_ninos   TINYINT(1)      NULL,
                presupuesto       DECIMAL(10, 2)  NULL,
                dias_viaje        INT             NULL,
                tipo_viaje        VARCHAR(50)     NULL,
                generado_en       TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recomendaciones_ia_detalle (
                id                BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
                recomendacion_id  BIGINT           NOT NULL,
                tour_id           BIGINT UNSIGNED  NULL,
                destino_nombre    VARCHAR(200)     NOT NULL DEFAULT '',
                score             DECIMAL(6, 4)    NULL,
                FOREIGN KEY (recomendacion_id)
                    REFERENCES recomendaciones_ia(id) ON DELETE CASCADE
            )
        """)
        conexion.commit()
        print("[OK] Tablas recomendaciones_ia y recomendaciones_ia_detalle verificadas")
    except Exception as e:
        print(f"[ERROR] _inicializar_tablas: {e}")
        traceback.print_exc()
    finally:
        cursor.close()
        conexion.close()


load_models()
_inicializar_tablas()


def _encode_safe(encoder, value: str):
    classes = list(encoder.classes_)
    return classes.index(value) if value in classes else 0


def _build_feature_row(body: Dict[str, Any]) -> list:
    pais_enc = _encode_safe(encoders["País / Procedencia"], str(body.get("País / Procedencia", "Perú")))
    idioma_enc = _encode_safe(encoders["Idioma"], str(body.get("Idioma", "Español")))
    tipo_enc = _encode_safe(encoders["Tipo de viaje"], str(body.get("Tipo de viaje", "Cultural")))
    return [
        int(body.get("Edad", 25)),
        pais_enc,
        idioma_enc,
        int(body.get("Presupuesto", 1)),
        int(body.get("Días de viaje", 5)),
        tipo_enc,
        int(body.get("Problemas respiratorios", 0)),
        int(body.get("Movilidad reducida", 0)),
        int(body.get("Alergias", 0)),
        int(body.get("Apto para adulto mayor", 1)),
        int(body.get("Apto para niños", 0)),
        int(body.get("Comida", 1)),
        int(body.get("Naturaleza", 1)),
        int(body.get("Historia", 1)),
        int(body.get("Fotografía", 1)),
        int(body.get("Trekking", 1)),
        int(body.get("Nivel de dificultad", 1)),
        int(body.get("Requiere caminata", 1)),
        int(body.get("Altura máxima tolerada", 3500)),
    ]


def _guardar_recomendacion_db(body: Dict[str, Any], resultados: list):
    """
    Guarda la consulta al recomendador y sus resultados en MySQL.
    Siempre guarda destino_nombre; tour_id es NULL si no hay coincidencia en tours.
    """
    conexion = obtener_conexion()
    if not conexion:
        return
    cursor = conexion.cursor()
    try:
        # 1. Insertar cabecera con reserva_id=NULL (no vinculado a una reserva)
        cursor.execute(
            """
            INSERT INTO recomendaciones_ia (
                reserva_id, edad, pais_procedencia, viaja_con_ninos,
                presupuesto, dias_viaje, tipo_viaje, generado_en
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
            """,
            (
                None,
                int(body.get("Edad", 25)),
                str(body.get("País / Procedencia", "Perú")),
                int(body.get("Apto para niños", 0)),
                float(body.get("Presupuesto", 1)),
                int(body.get("Días de viaje", 5)),
                str(body.get("Tipo de viaje", "Cultural")),
            ),
        )
        rec_id = cursor.lastrowid

        if not rec_id:
            print("[ERROR] lastrowid es 0, abortando")
            conexion.rollback()
            return

        # 2. Insertar un detalle por cada destino recomendado
        for item in resultados:
            destino_nombre = item.get("destino", "Desconocido")
            score_val = float(item.get("score", 0))

            # Buscar tour por nombre (tour_id=NULL si no hay match)
            cursor.execute(
                "SELECT id FROM tours WHERE nombre LIKE %s AND estado = 1 LIMIT 1",
                (f"%{destino_nombre[:40]}%",),
            )
            fila_tour = cursor.fetchone()
            tour_id = fila_tour[0] if fila_tour else None

            cursor.execute(
                """
                INSERT INTO recomendaciones_ia_detalle
                    (recomendacion_id, tour_id, destino_nombre, score)
                VALUES (%s, %s, %s, %s)
                """,
                (rec_id, tour_id, destino_nombre, score_val),
            )

        conexion.commit()
        print(f"[OK] Recomendación id={rec_id} guardada con {len(resultados)} detalles")

    except Exception as e:
        print(f"[ERROR] _guardar_recomendacion_db falló: {e}")
        traceback.print_exc()
        try:
            conexion.rollback()
        except Exception:
            pass
    finally:
        try:
            cursor.close()
        except Exception:
            pass
        try:
            conexion.close()
        except Exception:
            pass


@router.get("/recomendar/status")
def recomendar_status():
    return {
        "service": "Recomendador ML",
        "status": "ok" if model is not None else "disabled",
        "classes": len(target_encoder.classes_) if target_encoder else 0,
    }


@router.post("/recomendar")
def recomendar(body: Dict[str, Any]):
    if model is None or encoders is None or target_encoder is None:
        raise HTTPException(status_code=503, detail="Modelos de recomendación no disponibles")

    try:
        row = _build_feature_row(body)
        X = pd.DataFrame([row], columns=FEATURES)
        probs = model.predict_proba(X)[0]

        altura_usuario = row[FEATURES.index("Altura máxima tolerada")]
        requiere_caminata = row[FEATURES.index("Requiere caminata")]
        trekking = row[FEATURES.index("Trekking")]

        recomendaciones = []
        for idx, prob in enumerate(probs):
            destino = target_encoder.inverse_transform([idx])[0]
            altura_destino = altura_destinos.get(destino, 3400) if altura_destinos else 3400

            if altura_usuario < altura_destino:
                prob = 0.0

            if (requiere_caminata == 0 or trekking == 0) and any(
                k in destino.lower() for k in ["trekking", "caminata", "nevado", "salkantay"]
            ):
                prob = 0.0

            recomendaciones.append({"destino": destino, "score": round(float(prob), 4)})

        recomendaciones.sort(key=lambda x: x["score"], reverse=True)
        validos = [r for r in recomendaciones if r["score"] > 0]

        if not validos:
            validos = [{"destino": "Centro Histórico de Cusco (City Tour o Museos)", "score": 1.0}]

        top5 = validos[:5]
        _guardar_recomendacion_db(body, top5)
        return top5

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en predicción: {str(e)}")
