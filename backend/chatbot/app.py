import os
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import chromadb
from sentence_transformers import SentenceTransformer
import numpy as np
import requests
import sqlite3

# ------------------ Paths y config ------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KB_PATH   = os.path.join(BASE_DIR, "kb_store")
DOCS_PATH = os.path.join(BASE_DIR, "docs")
DATA_PATH = os.path.join(BASE_DIR, "data")
DB_PATH   = os.path.join(DATA_PATH, "memory.sqlite")

# LLM local por defecto
OLLAMA_URL   = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma3:1b")
TOP_K_DEFAULT = int(os.environ.get("TOP_K", "3"))
LLM_TEMP = float(os.environ.get("LLM_TEMP", "0.2"))

# ------------------ FastAPI ------------------
app = FastAPI(
    title="Travel Assistant",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Vector store (Chroma) ------------------
client = chromadb.PersistentClient(path=KB_PATH)
kb = client.get_or_create_collection(
    "travel_assistant_kb", 
    metadata={"hnsw:space": "cosine"}
)

# ------------------ Embeddings ------------------
EMB = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

def embed_texts(texts: List[str]) -> List[List[float]]:
    embs = EMB.encode(texts, normalize_embeddings=True, convert_to_numpy=True)
    return [e.astype(np.float32).tolist() for e in embs]

# ------------------ Memoria (SQLite) ------------------
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

def get_recent_facts(user_id: str, limit: int = 5) -> list:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "SELECT fact_text FROM mem_facts WHERE user_id=? ORDER BY id DESC LIMIT ?",
        (user_id, limit)
    )
    rows = [r[0] for r in cur.fetchall()]
    conn.close()
    return rows

def add_fact(user_id: str, fact_text: str):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO mem_facts(user_id,fact_text) VALUES(?,?)", (user_id, fact_text))
    conn.commit()
    conn.close()

def add_episode(user_id: str, title: str, details: str, timestamp: str):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO mem_episodes(user_id,title,details,timestamp) VALUES(?,?,?,?)",
        (user_id, title, details, timestamp),
    )
    conn.commit()
    conn.close()

init_db()

# ------------------ Schemas ------------------
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

# ------------------ Intent simple ------------------
def detect_intent(q: str) -> str:
    t = q.lower()

    if any(w in t for w in [
        "hola",
        "buenas",
        "saludos",
        "buen día",
        "buenos días"
    ]):
        return "saludo"

    if any(w in t for w in [
        "adios",
        "adiós",
        "hasta luego",
        "gracias",
        "nos vemos"
    ]):
        return "despedida"

    if any(w in t for w in [
        "recuerda que",
        "acuérdate que",
        "acuerdate que"
    ]):
        return "memorizar"

    return "consulta"

# ------------------ LLM ------------------
def call_ollama(prompt: str) -> Optional[str]:
    try:
        payload = {
            "model": OLLAMA_MODEL, 
            "prompt": prompt, 
            "stream": False, 
            "options": {"temperature": LLM_TEMP}
        }
        r = requests.post(OLLAMA_URL, json=payload, timeout=90)
        if r.status_code != 200:
            print("[OLLAMA] HTTP", r.status_code, r.text[:300])
            return None
        return r.json().get("response", "")
    except Exception as e:
        print("[OLLAMA] exception:", repr(e))
        return None

# ------------------ RAG ------------------
def query_kb(query: str, top_k: int):
    q_vec = embed_texts([query])[0]
    res = kb.query(query_embeddings=[q_vec], n_results=top_k)
    docs  = res.get("documents", [[]])[0]
    metas = res.get("metadatas", [[]])[0]
    return docs, metas

def build_prompt(user_id: str, query: str, docs: list, metas: list, facts: list) -> str:
    ctx_lines = []

    for d, m in zip(docs, metas):
        src = m.get("source", "?") if isinstance(m, dict) else "?"
        page = m.get("page", "?") if isinstance(m, dict) else "?"

        ctx_lines.append(
            f"- {d}\n"
            f"  (fuente: {src} página {page})"
        )

    ctx = "\n".join(ctx_lines) if ctx_lines else "(sin contexto)"
    mem = "\n".join([f"- {f}" for f in facts]) if facts else "(sin información previa)"

    return f"""
Eres Travel Assistant, un asistente inteligente especializado en turismo.

Ayudas a los viajeros con información sobre:

- Destinos turísticos
- Cultura e historia
- Gastronomía
- Restaurantes
- Hoteles
- Transporte
- Tours y excursiones
- Museos
- Sitios arqueológicos
- Turismo de aventura
- Recomendaciones de viaje
- Horarios y precios

REGLAS:

1. Usa únicamente el contexto proporcionado.
2. No inventes información.
3. Si no encuentras la respuesta indica:
   "No encontré información suficiente en la base de conocimiento."
4. Responde siempre en español.
5. Sé amable y profesional.

Memoria del usuario:
{mem}

Pregunta:
{query}

Contexto:
{ctx}

Formato:

Respuesta:
Fuentes:
"""

# ------------------ Rutas ------------------
router = APIRouter()

@router.post("/ask", response_model=AskResp)
def ask(body: AskReq):
    intent = detect_intent(body.query)
    low = body.query.lower()  # No se usa pero lo dejamos

    # Respuestas fijas
    if intent == "saludo":
        return AskResp(
            intent=intent, 
            answer="¡Hola! Soy Travel Assistant. Puedo ayudarte con destinos turísticos, hoteles, restaurantes, tours y recomendaciones de viaje.",
            sources=[]
        )
    
    if intent == "despedida":
        return AskResp(
            intent=intent,
            answer="¡Hasta luego! Espero que disfrutes tu próxima aventura.",
            sources=[]
        )
    
    if intent == "memorizar":
        add_fact(body.user_id, body.query)
        return AskResp(
            intent=intent,
            answer="Información guardada correctamente.",
            sources=[]
        )
    
    # Consulta RAG + LLM
    facts = get_recent_facts(body.user_id, limit=5)
    docs, metas = query_kb(body.query, body.top_k)
    prompt = build_prompt(body.user_id, body.query, docs, metas, facts)
    answer = call_ollama(prompt)

    # Fallback si no hay LLM
    if answer is None:
        if docs:
            snippet = (docs[0][:220] + "...") if len(docs[0]) > 220 else docs[0]
            fuentes = ", ".join(sorted({f"{m.get('source','?')} p.{m.get('page','?')}" for m in metas if isinstance(m, dict)}))
            answer = (
                "No pude utilizar el modelo local en este momento, "
                "pero encontré la siguiente información en los documentos:\n\n"
                f"{snippet}\n\n"
                f"Fuentes: {fuentes}"
            )
        else:
            answer = "No pude usar el modelo local y no encontré información en tus documentos. Indexa PDFs en /docs y vuelve a intentar."

    return AskResp(intent="consulta", answer=answer, sources=metas)

@router.post("/mem/fact")
def mem_fact(m: MemFact):
    add_fact(m.user_id, m.fact_text)
    return {"ok": True}

@router.post("/mem/episode")
def mem_episode(m: MemEpisode):
    add_episode(m.user_id, m.title, m.details, m.timestamp)
    return {"ok": True}

@router.post("/index/upload")
async def upload_pdf(file: UploadFile = File(...)):
    os.makedirs(DOCS_PATH, exist_ok=True)
    out_path = os.path.join(DOCS_PATH, file.filename)
    with open(out_path, "wb") as f:
        f.write(await file.read())
    return {"ok": True, "saved_as": file.filename}

# ---- Monta el frontend ----
app.include_router(router)

# Verificar si existe la carpeta frontend antes de montarla
frontend_path = os.path.join(BASE_DIR, "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    print(f"⚠️ Advertencia: No se encontró la carpeta 'frontend' en {frontend_path}")