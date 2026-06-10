# Travel Assistant — Sistema de Asistencia Turística para Cusco

Proyecto de titulación universitaria. Sistema inteligente de recomendación turística para la región de Cusco, Perú. Integra tres módulos de IA: recomendador con Machine Learning, chatbot con RAG y reconocimiento de imágenes.

---

## Requisitos previos

Antes de instalar, asegúrate de tener lo siguiente:

| Herramienta | Versión mínima | Descarga |
|-------------|---------------|----------|
| Python | 3.10 | https://www.python.org/downloads/ |
| Node.js | 18.0 | https://nodejs.org/ |
| Ollama | última | https://ollama.com |
| Git | cualquiera | https://git-scm.com |

---

## 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd proyecttodetitulacion
```

---

## 2. Instalar Ollama y el modelo de lenguaje

Ollama es el motor que corre el modelo de IA de forma local (sin internet ni costo).

```bash
# Descargar e instalar Ollama desde: https://ollama.com
# Luego en la terminal, descargar el modelo:
# Opción recomendada
ollama pull llama3

# Opción más rápida y ligera
ollama pull llama3.2:3b
```

> El modelo pesa ~2 GB. Solo se descarga una vez.

---

## 3. Backend — Python

### 3.1 Crear entorno virtual (recomendado)

```bash
cd backend
python -m venv venv
```

Activar el entorno:

- **Windows:**
  ```bash
  venv\Scripts\activate
  ```
- **Mac / Linux:**
  ```bash
  source venv/bin/activate
  ```

### 3.2 Instalar dependencias

```bash
pip install -r requirements.txt
```

> La instalación puede tardar varios minutos la primera vez (TensorFlow y SentenceTransformers son pesados).

### 3.3 Verificar modelos entrenados

Asegúrate de que existan estos archivos (ya están incluidos en el repositorio):

```
backend/
├── ml/trained_models/
│   ├── modelo.pkl
│   ├── encoders.pkl
│   ├── target_encoder.pkl
│   └── altura_destinos.pkl
└── reconocedoriamagenes/trained_models/
    ├── mejor_modelo.keras
    └── clases.txt
```

---

## 4. Frontend — Node.js

```bash
cd frontend
npm install
```

> Esto instala React, TailwindCSS, Leaflet (mapa interactivo) y todas las dependencias automáticamente.

---

## 5. Ejecutar el proyecto

Necesitas **tres terminales** abiertas al mismo tiempo:

### Terminal 1 — Ollama (modelo de IA)

```bash
ollama serve
```

> Deja esta terminal abierta. Ollama escucha en `http://localhost:11434`

### Terminal 2 — Backend (API FastAPI)

```bash
cd backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

uvicorn api.app.main:app --reload --port 8000
```

> La API queda disponible en `http://localhost:8000`
> Documentación automática: `http://localhost:8000/docs`

### Terminal 3 — Frontend (React)

```bash
cd frontend
npm run dev
```

> La app queda disponible en `http://localhost:5173`

---

## 6. Estructura del proyecto

```
proyecttodetitulacion/
├── backend/
│   ├── api/
│   │   └── app/
│   │       ├── main.py              # Punto de entrada FastAPI
│   │       └── routes/
│   │           ├── recomendacion.py # Recomendador ML (POST /recomendar)
│   │           ├── chatbot.py       # Chatbot RAG  (POST /chatbot/ask)
│   │           └── vision.py        # Visión IA    (POST /vision/predict)
│   ├── ml/
│   │   ├── trained_models/          # Modelos ML entrenados (.pkl)
│   │   └── training/                # Scripts de entrenamiento
│   ├── reconocedoriamagenes/
│   │   ├── trained_models/          # Modelo Keras + clases
│   │   └── training/                # Entrenamiento del clasificador
│   ├── chatbot/
│   │   ├── docs/                    # PDFs de conocimiento turístico
│   │   └── kb_store/                # Base vectorial ChromaDB
│   └── requirements.txt             # Dependencias Python (este archivo)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Recomendador.tsx     # Planificador con mapa interactivo
│   │   │   ├── ChatBot.tsx          # Chatbot con RAG
│   │   │   └── PerfilViajero.tsx    # Reconocimiento de imágenes
│   │   └── components/
│   │       └── MapaDestinos.tsx     # Mapa Leaflet de destinos
│   └── package.json                 # Dependencias Node.js
└── README.md
```

---

## 7. Endpoints principales de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/recomendar` | Recibe perfil del viajero → retorna Top 5 destinos ML |
| `POST` | `/chatbot/ask` | Pregunta al chatbot RAG sobre turismo en Cusco |
| `POST` | `/chatbot/recognize` | Identifica lugar turístico en una imagen (visión + RAG) |
| `POST` | `/vision/predict` | Clasifica imagen de lugar turístico |
| `POST` | `/chatbot/upload` | Sube un PDF a la base de conocimiento |
| `GET` | `/docs` | Documentación interactiva Swagger UI |

---

## 8. Reentrenar los modelos (opcional)

Si quieres reentrenar con nuevos datos:

```bash
# Recomendador ML
cd backend/ml/training/recomendador_turismo
python balancear_dataset.py   # Balancear el dataset primero
python train.py               # Entrenar y guardar los .pkl

# Reconocedor de imágenes
cd backend/reconocedoriamagenes/training
python train.py               # Requiere GPU o tiempo considerable
```

---

## 9. Solución de problemas comunes

**Error: `No module named 'fastapi'`**
→ Asegúrate de haber activado el entorno virtual antes de correr uvicorn.

**Error: `Modelos de recomendación no disponibles`**
→ Verifica que los archivos `.pkl` existan en `backend/ml/trained_models/`.

**Error: `Modelo de visión no disponible`**
→ Verifica que `mejor_modelo.keras` exista en `backend/reconocedoriamagenes/trained_models/`.

**El chatbot responde "tuve un problema procesando tu consulta"**
→ Verifica que Ollama esté corriendo (`ollama serve`) y que el modelo esté descargado (`ollama pull llama3.2`).

**El mapa no aparece**
→ Verifica que el frontend tiene instalado leaflet: dentro de `frontend/` corre `npm install`.
