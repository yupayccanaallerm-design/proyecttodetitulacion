import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ===== CONFIGURACIÓN DE ENTORNO (SIEMPRE AL INICIO) =====
# Suprimir warnings de TensorFlow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # 0=all, 1=no INFO, 2=no WARNING, 3=no ERROR
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
# Deshabilitar telemetría de ChromaDB
os.environ['ANONYMIZED_TELEMETRY'] = 'False'
# Opcional: Suprimir warnings de oneDNN
os.environ['TF_CPP_MIN_VLOG_LEVEL'] = '3'

# Importamos tus rutas internas (Tours ya procesará Base64)
from .routes.recomendacion import router as recomendacion_router
from .routes.chatbot import router as chatbot_router
from .routes.vision import router as vision_router
from .routes.paquetes import router as paquetes_router  
from .routes.tours import router as tours_router
from .routes.auth import router as auth_router
from .routes.usuarios import router as usuarios_router

# ===== CONFIGURACIÓN DE PATHS =====
BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

# ===== INICIALIZACIÓN DE FASTAPI =====
app = FastAPI(
    title="Travel Assistant API",
    description="API para asistente de viajes con recomendaciones, chatbot y visión (Basado en Base64)",
    version="1.0.0"
)

# ===== MIDDLEWARE CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=False,  # Si necesitas cookies/tokens, cámbialo a True
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== ROUTERS =====
app.include_router(recomendacion_router)
app.include_router(chatbot_router)
app.include_router(vision_router)
app.include_router(tours_router)
app.include_router(paquetes_router)
app.include_router(auth_router)
app.include_router(usuarios_router)
# ===== ENDPOINT DE PRUEBA =====
@app.get("/")
async def root():
    return {
        "message": "Travel Assistant API",
        "version": "1.0.0",
        "status": "running",
        "storage_mode": "Database (Base64)"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}