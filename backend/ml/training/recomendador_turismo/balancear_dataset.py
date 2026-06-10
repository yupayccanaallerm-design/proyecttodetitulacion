"""
Script para balancear el dataset de recomendación turística.

Problema detectado:
- El dataset infoturistas.csv tiene >80% de registros con "Machu Picchu" como destino
- Muchos destinos del catálogo (destinos.csv) no aparecen en el entrenamiento

Solución:
- Submuestrear destinos sobrerrepresentados (Machu Picchu)
- Generar datos sintéticos para destinos subrepresentados
- Incluir TODOS los destinos del catálogo con al menos algunas muestras
"""

import pandas as pd
import numpy as np
import os
import random
from itertools import product

# =========================
# CONFIGURACIÓN
# =========================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "infoturistas.csv")
DESTINOS_PATH = os.path.join(BASE_DIR, "datasets", "destinos.csv")
OUTPUT_PATH = os.path.join(BASE_DIR, "datasets", "infoturistas_balanceado.csv")

# =========================
# CARGAR DATOS
# =========================

print("📊 Cargando dataset original...")
df = pd.read_csv(DATASET_PATH)
destinos_df = pd.read_csv(DESTINOS_PATH)

print(f"   Registros originales: {len(df)}")
print(f"   Destinos en catálogo: {len(destinos_df)}")
print(f"   Destinos en dataset: {df['Destino'].nunique()}")

# =========================
# ANALIZAR DISTRIBUCIÓN
# =========================

dist = df["Destino"].value_counts()
print("\n📈 Distribución actual:")
for dest, count in dist.items():
    pct = count / len(df) * 100
    bar = "█" * int(pct / 2)
    print(f"   {dest:40s} {count:4d} ({pct:5.1f}%) {bar}")

# =========================
# SUBMUESTREAR DESTINOS SOBRERREPRESENTADOS
# =========================

MAX_SAMPLES_PER_DESTINO = 30  # Máximo de muestras por destino

df_balanced = pd.DataFrame()
for destino in df["Destino"].unique():
    subset = df[df["Destino"] == destino]
    if len(subset) > MAX_SAMPLES_PER_DESTINO:
        subset = subset.sample(n=MAX_SAMPLES_PER_DESTINO, random_state=42)
    df_balanced = pd.concat([df_balanced, subset], ignore_index=True)

print(f"\n📉 Después de submuestrear: {len(df_balanced)} registros")

# =========================
# IDENTIFICAR DESTINOS FALTANTES
# =========================

destinos_existentes = set(df["Destino"].unique())
destinos_catalogo = set(destinos_df["Destino"].unique())
destinos_faltantes = destinos_catalogo - destinos_existentes

print(f"\n🔍 Destinos en catálogo que NO están en el dataset: {len(destinos_faltantes)}")
for d in sorted(destinos_faltantes)[:20]:
    print(f"   - {d}")
if len(destinos_faltantes) > 20:
    print(f"   ... y {len(destinos_faltantes) - 20} más")

# =========================
# GENERAR DATOS SINTÉTICOS
# =========================

# Feature templates para generar variaciones
paises = ["Perú", "Argentina", "Chile", "Brasil", "México", "Estados Unidos", 
          "España", "Francia", "Alemania", "Italia", "Reino Unido", "Canadá",
          "Australia", "Japón", "China", "Corea del Sur", "Colombia", "Ecuador",
          "Bolivia", "Uruguay", "Venezuela", "Costa Rica", "India"]

idiomas = {"Perú": "Español", "Argentina": "Español", "Chile": "Español",
           "Brasil": "Portugués", "México": "Español", "Estados Unidos": "Inglés",
           "España": "Español", "Francia": "Francés", "Alemania": "Alemán",
           "Italia": "Italiano", "Reino Unido": "Inglés", "Canadá": "Inglés",
           "Australia": "Inglés", "Japón": "Japonés", "China": "Chino",
           "Corea del Sur": "Coreano", "Colombia": "Español", "Ecuador": "Español",
           "Bolivia": "Español", "Uruguay": "Español", "Venezuela": "Español",
           "Costa Rica": "Español", "India": "Inglés"}

presupuestos = ["Económico", "Medio", "Alto"]
tipos_viaje = ["Cultural", "Aventura", "Relajación", "Mochilero", "Fotografía", "Gastronómico", "Naturaleza"]
edad_ranges = [(18, 25), (25, 35), (35, 50), (50, 70)]
dias_ranges = [(2, 4), (5, 7), (8, 14)]
alturas = [2500, 3000, 3400, 3500, 3600, 3700, 3800, 4000, 4200, 4300, 4500, 5000]

# Función para generar altitud según dificultad del destino
def get_altitud_para_destino(destino):
    row = destinos_df[destinos_df["Destino"] == destino]
    if not row.empty and "Altitud_msnm" in row.columns:
        try:
            return int(row.iloc[0]["Altitud_msnm"])
        except (ValueError, TypeError):
            pass
    return random.choice(alturas)

# Generar datos sintéticos para destinos faltantes
SAMPLES_PER_NEW_DESTINO = 15
nuevos_registros = []

for destino in sorted(destinos_faltantes):
    destino_info = destinos_df[destinos_df["Destino"] == destino]
    dificultad = "Medio"
    requiere_caminata = "Sí"
    apto_ninos = "Sí"
    apto_mayor = "Sí"
    
    if not destino_info.empty:
        dificultad = destino_info.iloc[0].get("Dificultad", "Medio") if "Dificultad" in destino_info.columns else "Medio"
        requiere_caminata = destino_info.iloc[0].get("Requiere_caminata", "Sí") if "Requiere_caminata" in destino_info.columns else "Sí"
        apto_ninos = destino_info.iloc[0].get("Apto_niños", "Sí") if "Apto_niños" in destino_info.columns else "Sí"
        apto_mayor = destino_info.iloc[0].get("Apto_adulto_mayor", "Sí") if "Apto_adulto_mayor" in destino_info.columns else "Sí"
    
    for _ in range(SAMPLES_PER_NEW_DESTINO):
        pais = random.choice(paises)
        edad = random.randint(18, 70)
        idioma = idiomas.get(pais, "Español")
        presupuesto = random.choice(presupuestos)
        dias = random.randint(2, 14)
        tipo = random.choice(tipos_viaje)
        altura = get_altitud_para_destino(destino)
        
        # Ajustar según dificultad
        if dificultad == "Alto" and random.random() < 0.6:
            tipo = "Aventura"
            dias = max(5, dias)
        elif dificultad == "Bajo" and random.random() < 0.4:
            tipo = "Relajación"
        
        # Salud (problemas respiratorios)
        prob_resp = random.choice(["No", "Sí"] if random.random() < 0.15 else ["No"])
        mov_reducida = random.choice(["No", "Sí"] if random.random() < 0.1 else ["No"])
        
        datos = {
            "Edad": edad,
            "País / Procedencia": pais,
            "Idioma": idioma,
            "Presupuesto": presupuesto,
            "Días de viaje": dias,
            "Tipo de viaje": tipo,
            "Problemas respiratorios": prob_resp,
            "Movilidad reducida": mov_reducida,
            "Alergias": random.choice(["No", "Sí"]),
            "Comida": random.choice(["No", "Sí"]),
            "Naturaleza": random.choice(["No", "Sí"]),
            "Historia": random.choice(["No", "Sí"]),
            "Fotografía": random.choice(["No", "Sí"]),
            "Altura máxima tolerada": altura,
            "Recomendación médica": random.choice([
                "Hidratación constante", "Aclimatación previa", 
                "Descanso adecuado", "Consumir mate de coca"
            ]),
            "Destino": destino
        }
        nuevos_registros.append(datos)

df_nuevos = pd.DataFrame(nuevos_registros)
print(f"\n✨ Datos sintéticos generados: {len(df_nuevos)} registros para {len(destinos_faltantes)} destinos")

# =========================
# UNIR TODO
# =========================

df_final = pd.concat([df_balanced, df_nuevos], ignore_index=True)

# =========================
# VERIFICAR BALANCE FINAL
# =========================

print("\n📊 Distribución final balanceada:")
dist_final = df_final["Destino"].value_counts()
for dest, count in dist_final.items():
    pct = count / len(df_final) * 100
    bar = "█" * int(pct)
    print(f"   {dest:40s} {count:4d} ({pct:5.1f}%) {bar}")

print(f"\n📊 Resumen:")
print(f"   Registros originales: {len(df)}")
print(f"   Registros balanceados: {len(df_final)}")
print(f"   Destinos únicos: {df_final['Destino'].nunique()}")
print(f"   Destinos del catálogo cubiertos: {len(set(destinos_catalogo) & set(df_final['Destino'].unique()))}/{len(destinos_catalogo)}")

# =========================
# GUARDAR
# =========================

df_final.to_csv(OUTPUT_PATH, index=False)
print(f"\n✅ Dataset balanceado guardado en: {OUTPUT_PATH}")
print(f"\n💡 Para usarlo, actualiza train.py para cargar '{os.path.basename(OUTPUT_PATH)}'")
