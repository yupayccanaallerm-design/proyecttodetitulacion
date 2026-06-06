import os
import sqlite3
from typing import List, Optional

import chromadb
import numpy as np
import requests

from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

# ==================================================
# CONFIGURACIÓN
# ==================================================

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)

KB_PATH = os.path.join(BASE_DIR, "kb_store")
DOCS_PATH = os.path.join(BASE_DIR, "docs")
DATA_PATH = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_PATH, "memory.sqlite")

OLLAMA_URL = os.environ.get(
    "OLLAMA_URL",
    "http://localhost:11434/api/generate"
)

OLLAMA_MODEL = os.environ.get(
    "OLLAMA_MODEL",
    "llama3.2"  # Cambiado a llama3.2 que tienes instalado
)

TOP_K_DEFAULT = int(
    os.environ.get("TOP_K", "3")
)

LLM_TEMP = float(
    os.environ.get("LLM_TEMP", "0.2")
)

# ==================================================
# CHROMA DB
# ==================================================

client = chromadb.PersistentClient(path=KB_PATH)

kb = client.get_or_create_collection(
    "travel_assistant_kb",
    metadata={"hnsw:space": "cosine"}
)

# ==================================================
# EMBEDDINGS
# ==================================================

EMB = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

def embed_texts(texts: List[str]):
    embs = EMB.encode(
        texts,
        normalize_embeddings=True,
        convert_to_numpy=True
    )

    return [
        e.astype(np.float32).tolist()
        for e in embs
    ]

# ==================================================
# SQLITE MEMORY
# ==================================================

def init_db():
    os.makedirs(DATA_PATH, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS mem_facts(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        fact_text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS mem_episodes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        title TEXT,
        details TEXT,
        timestamp TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

init_db()

# ==================================================
# MODELOS
# ==================================================

class AskReq(BaseModel):
    user_id: str = "usuario"
    query: str
    top_k: int = TOP_K_DEFAULT


class AskResp(BaseModel):
    intent: str
    answer: str
    sources: list


class MemFact(BaseModel):
    user_id: str
    fact_text: str


class MemEpisode(BaseModel):
    user_id: str
    title: str
    details: str
    timestamp: str


# ==================================================
# MEMORIA
# ==================================================

def get_recent_facts(user_id: str, limit: int = 5):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute(
        """
        SELECT fact_text
        FROM mem_facts
        WHERE user_id=?
        ORDER BY id DESC
        LIMIT ?
        """,
        (user_id, limit)
    )

    rows = [r[0] for r in cur.fetchall()]

    conn.close()

    return rows


def add_fact(user_id: str, fact_text: str):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO mem_facts(user_id,fact_text)
        VALUES(?,?)
        """,
        (user_id, fact_text)
    )

    conn.commit()
    conn.close()


def add_episode(user_id, title, details, timestamp):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO mem_episodes(
            user_id,
            title,
            details,
            timestamp
        )
        VALUES(?,?,?,?)
        """,
        (user_id, title, details, timestamp)
    )

    conn.commit()
    conn.close()

# ==================================================
# INTENTS
# ==================================================

def detect_intent(query: str):

    q = query.lower()

    if any(x in q for x in [
        "hola",
        "buenas",
        "buenos dias",
        "saludos",
        "hey",
        "holi"
    ]):
        return "saludo"

    if any(x in q for x in [
        "adios",
        "hasta luego",
        "nos vemos",
        "chao"
    ]):
        return "despedida"

    if "recuerda que" in q or "aprende que" in q:
        return "memorizar"

    return "consulta"

# ==================================================
# OLLAMA
# ==================================================

def call_ollama(prompt: str) -> Optional[str]:

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": LLM_TEMP
                }
            },
            timeout=90
        )

        if response.status_code != 200:
            print(f"Error en Ollama: {response.status_code}")
            return None

        return response.json().get("response", "")

    except Exception as e:
        print(f"Error llamando a Ollama: {e}")
        return None

# ==================================================
# RAG
# ==================================================

def query_kb(query: str, top_k: int):

    vector = embed_texts([query])[0]

    result = kb.query(
        query_embeddings=[vector],
        n_results=top_k
    )

    docs = result.get("documents", [[]])[0]
    metas = result.get("metadatas", [[]])[0]

    return docs, metas

# ==================================================
# PROMPT
# ==================================================

def build_prompt(query, docs, metas):

    context = []

    for d, m in zip(docs, metas):
        source = m.get("source", "?")
        page = m.get("page", "?")

        context.append(
            f"{d}\nFuente: {source} Página: {page}"
        )

    ctx = "\n\n".join(context)

    return f"""Eres Travel Assistant, un experto en turismo de Cusco, Perú.

Especialista en:
- Turismo y destinos turísticos
- Hoteles y alojamiento
- Restaurantes y gastronomía
- Tours y excursiones
- Cultura e historia
- Transporte y logística
- Clima y mejor época para visitar

Instrucciones importantes:
1. Usa SOLO la información del contexto proporcionado
2. Si no encuentras la información en el contexto, indica que no está disponible
3. Responde en español de manera amigable y útil
4. Sé conciso pero informativo

Pregunta del usuario: {query}

Contexto de la base de conocimiento:
{ctx}

Respuesta:"""

# ==================================================
# ENDPOINTS
# ==================================================

@router.get("/config")
def get_config():
    """Retorna la configuración actual del chatbot"""
    return {
        "model": OLLAMA_MODEL,
        "ollama_url": OLLAMA_URL,
        "top_k": TOP_K_DEFAULT,
        "temperature": LLM_TEMP,
        "status": "online"
    }


@router.post("/ask")
def ask(body: AskReq):
    """Endpoint principal para consultar al chatbot"""
    
    intent = detect_intent(body.query)

    # Manejo de saludos
    if intent == "saludo":
        return {
            "intent": intent,
            "answer": "👋 ¡Hola! Soy Travel Assistant. ¿En qué puedo ayudarte con tu viaje a Cusco? Puedo informarte sobre tours, hoteles, restaurantes y más.",
            "sources": []
        }

    # Manejo de despedidas
    if intent == "despedida":
        return {
            "intent": intent,
            "answer": "✨ ¡Hasta pronto! Que tengas un excelente viaje. No dudes en volver si necesitas más información.",
            "sources": []
        }

    # Para consultas normales, usar RAG
    docs, metas = query_kb(body.query, body.top_k)
    
    # Si no hay documentos en la KB, usar respuesta genérica
    if not docs or len(docs) == 0:
        return {
            "intent": "consulta",
            "answer": "📚 Aún estoy aprendiendo sobre ese tema. ¿Podrías ser más específico o preguntar sobre Machu Picchu, Valle Sagrado, o recomendaciones generales para Cusco?",
            "sources": []
        }

    prompt = build_prompt(body.query, docs, metas)
    answer = call_ollama(prompt)

    if not answer:
        answer = "Lo siento, tuve un problema procesando tu consulta. Por favor, intenta de nuevo o reformula tu pregunta."

    return {
        "intent": intent,
        "answer": answer,
        "sources": metas
    }


@router.post("/mem/fact")
def save_fact(data: MemFact):
    """Guarda un hecho en la memoria del usuario"""
    add_fact(data.user_id, data.fact_text)
    return {"ok": True, "message": "Hecho guardado en memoria"}


@router.post("/mem/episode")
def save_episode(data: MemEpisode):
    """Guarda un episodio en la memoria del usuario"""
    add_episode(data.user_id, data.title, data.details, data.timestamp)
    return {"ok": True, "message": "Episodio guardado en memoria"}


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Sube un PDF a la base de documentos"""
    os.makedirs(DOCS_PATH, exist_ok=True)

    file_path = os.path.join(DOCS_PATH, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    return {
        "ok": True,
        "filename": file.filename,
        "message": "PDF subido exitosamente"
    }