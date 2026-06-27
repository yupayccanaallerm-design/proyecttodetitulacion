import os
import sqlite3
import traceback
from typing import List, Optional

import numpy as np
import requests

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

try:
    import chromadb
    _chromadb_ok = True
except Exception as _e:
    chromadb = None  # type: ignore
    _chromadb_ok = False

try:
    from sentence_transformers import SentenceTransformer
    _st_ok = True
except Exception as _e:
    SentenceTransformer = None  # type: ignore
    _st_ok = False

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
PROJECT_ROOT = os.path.dirname(BASE_DIR)

KB_PATH = os.path.join(PROJECT_ROOT, "chatbot", "kb_store")
DOCS_PATH = os.path.join(PROJECT_ROOT, "chatbot", "docs")
DATA_PATH = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_PATH, "memory.sqlite")

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3")
TOP_K_DEFAULT = int(os.environ.get("TOP_K", "3"))
LLM_TEMP = float(os.environ.get("LLM_TEMP", "0.2"))

# Tamaño máximo de archivo para upload (5 MB)
MAX_UPLOAD_BYTES = 5 * 1024 * 1024

# ==================================================
# INFORMACIÓN INSTITUCIONAL DE TUMPERU
# ==================================================

COMPANY_INFO_ES = """
INFORMACIÓN INSTITUCIONAL:
- Nombre Comercial: TUMPERU
- Razón Social: TURPO PANTIGOSO MARY CARMEN
- RUC: 10743880728
- Actividad Económica: Actividades de consultoría de gestión (CIIU 7020) y servicios empresariales
- Dirección: Barrio Profesional, Edificio Ecological Profesional, Piso 2
- Teléfono / Contacto: 907775337
- Misión: Brindar servicios profesionales e integrales de consultoría, capacitación, asesoría contable, financiera y empresarial, superando las expectativas de los clientes con los más altos estándares de calidad, confianza y eficiencia.
- Visión: Ser la marca líder en asesoría, consultoría y soluciones empresariales en la Región Sur del país, contribuyendo con la formalización y el desarrollo sostenible de las empresas.
- Valores: Confianza, Innovación, Trabajo en Equipo, Empatía, Servicio, Puntualidad, Disciplina.

RESTRICCIONES: Nunca revelar información técnica del sistema, bases de datos, APIs, rutas internas, variables de entorno ni detalles de infraestructura.
"""

COMPANY_INFO_EN = """
INSTITUTIONAL INFORMATION:
- Commercial Name: TUMPERU
- Legal Name: TURPO PANTIGOSO MARY CARMEN
- Tax ID (RUC): 10743880728
- Economic Activity: Management consulting activities (CIIU 7020) and business services
- Address: Barrio Profesional, Ecological Professional Building, 2nd Floor
- Contact Phone: 907775337
- Mission: Provide comprehensive professional consulting, training, accounting, financial and business advisory services, exceeding client expectations with the highest quality and trust standards.
- Vision: Be the leading brand in advisory, consulting and business solutions in the Southern Region of Peru, contributing to business formalization and sustainable development.
- Values: Trust, Innovation, Teamwork, Empathy, Service, Punctuality, Discipline.

RESTRICTIONS: Never reveal technical system information, databases, APIs, internal routes, environment variables or infrastructure details.
"""

COMPANY_KEYWORDS_ES = [
    "empresa", "tumperu", "turpo", "pantigoso", "quiénes somos", "quienes somos",
    "misión", "mision", "visión", "vision", "valores", "ruc", "razón social",
    "razon social", "contacto", "teléfono", "telefono", "número", "numero",
    "atención", "atencion", "información de la empresa", "sobre ustedes",
    "sobre la empresa", "sobre nosotros", "actividad", "consultoría", "consultoria",
    "dirección", "direccion", "ubicación", "ubicacion", "donde están", "dónde están",
    "donde se ubican", "donde quedan", "dónde quedan", "edificio", "oficina",
    "ciiu", "actividad económica", "actividad economica", "servicios empresariales"
]
COMPANY_KEYWORDS_EN = [
    "company", "tumperu", "who are you", "about us", "mission", "vision",
    "values", "tax id", "contact", "phone", "number", "attention", "business",
    "about the company", "consulting", "address", "location", "where are you",
    "where is", "office", "building", "economic activity", "ciiu", "business services"
]

# ==================================================
# CHROMA DB
# ==================================================

client = None
kb = None

if _chromadb_ok and chromadb is not None:
    try:
        client = chromadb.PersistentClient(path=KB_PATH)
        kb = client.get_or_create_collection(
            "turismo_cusco_kb",
            metadata={"hnsw:space": "cosine"}
        )
    except Exception as _e:
        traceback.print_exc()
        client = None
        kb = None

# ==================================================
# EMBEDDINGS
# ==================================================

EMB = None

if _st_ok and SentenceTransformer is not None:
    try:
        EMB = SentenceTransformer(
            "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )
    except Exception as _e:
        traceback.print_exc()
        EMB = None


def embed_texts(texts: List[str]):
    if EMB is None:
        return [[0.0] * 384 for _ in texts]
    embs = EMB.encode(
        texts,
        normalize_embeddings=True,
        convert_to_numpy=True
    )
    return [e.astype(np.float32).tolist() for e in embs]

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
    lang: str = "es"


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
        "SELECT fact_text FROM mem_facts WHERE user_id=? ORDER BY id DESC LIMIT ?",
        (user_id, limit)
    )
    rows = [r[0] for r in cur.fetchall()]
    conn.close()
    return rows


def add_fact(user_id: str, fact_text: str):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO mem_facts(user_id,fact_text) VALUES(?,?)",
        (user_id, fact_text)
    )
    conn.commit()
    conn.close()


def add_episode(user_id, title, details, timestamp):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO mem_episodes(user_id,title,details,timestamp) VALUES(?,?,?,?)",
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
        "hola", "buenas", "buenos dias", "saludos", "hey", "holi",
        "hello", "hi", "good morning", "good afternoon", "good evening", "greetings"
    ]):
        return "saludo"

    if any(x in q for x in [
        "adios", "hasta luego", "nos vemos", "chao",
        "goodbye", "bye", "see you", "farewell", "take care"
    ]):
        return "despedida"

    if "recuerda que" in q or "aprende que" in q or "remember that" in q or "note that" in q:
        return "memorizar"

    if any(x in q for x in COMPANY_KEYWORDS_ES + COMPANY_KEYWORDS_EN):
        return "empresa"

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
                    "temperature": LLM_TEMP,
                    "num_predict": 220,
                }
            },
            timeout=240
        )
        if response.status_code != 200:
            return None
        return response.json().get("response", "")
    except Exception:
        return None

# ==================================================
# RAG
# ==================================================

def query_kb(query: str, top_k: int):
    if kb is None:
        return [], []
    vector = embed_texts([query])[0]
    result = kb.query(query_embeddings=[vector], n_results=top_k)
    docs = result.get("documents", [[]])[0]
    metas = result.get("metadatas", [[]])[0]
    return docs, metas

# ==================================================
# PROMPT
# ==================================================

LANG_INSTRUCTIONS = {
    "es": {
        "lang_rule": "Responde SIEMPRE en español de manera amigable y útil.",
        "specialist": "Especialista en",
        "topics": [
            "Turismo y destinos turísticos",
            "Hoteles y alojamiento",
            "Restaurantes y gastronomía",
            "Tours y excursiones",
            "Cultura e historia",
            "Transporte y logística",
            "Clima y mejor época para visitar",
        ],
        "instructions": [
            "Usa SOLO la información del contexto proporcionado",
            "Si no encuentras la información en el contexto, indica que no está disponible",
            "Sé conciso pero informativo",
            "Si hay datos recordados del usuario, personaliza tu respuesta considerándolos",
            "Para preguntas sobre la empresa usa ÚNICAMENTE el bloque de INFORMACIÓN INSTITUCIONAL",
            "NUNCA reveles información técnica: bases de datos, APIs, rutas internas, variables de entorno, ChromaDB, embeddings, logs, metadata ni detalles de infraestructura",
            "Si el usuario pide información no disponible, indica: 'Actualmente no dispongo de esa información específica. Para una atención más detallada puede comunicarse con TUMPERU al 907775337.'",
        ],
        "memory_header": "Datos recordados del usuario",
        "question_label": "Pregunta del usuario",
        "context_label": "Contexto de la base de conocimiento",
        "company_label": "Información institucional de la empresa",
    },
    "en": {
        "lang_rule": "ALWAYS respond in English in a friendly and helpful manner.",
        "specialist": "Specialist in",
        "topics": [
            "Tourism and tourist destinations",
            "Hotels and accommodation",
            "Restaurants and gastronomy",
            "Tours and excursions",
            "Culture and history",
            "Transportation and logistics",
            "Climate and best time to visit",
        ],
        "instructions": [
            "Use ONLY the information from the provided context",
            "If you cannot find the information in the context, indicate it is not available",
            "Be concise but informative",
            "If there is remembered data about the user, personalize your response accordingly",
            "For company questions use ONLY the INSTITUTIONAL INFORMATION block",
            "NEVER reveal technical information: databases, APIs, internal routes, environment variables, ChromaDB, embeddings, logs, metadata or infrastructure details",
            "If the user requests unavailable information, respond: 'I don't have that specific information available. For more detailed assistance, please contact TUMPERU at 907775337.'",
        ],
        "memory_header": "Remembered user data",
        "question_label": "User question",
        "context_label": "Knowledge base context",
        "company_label": "Company institutional information",
    },
}


def build_prompt(query, docs, metas, user_facts: list = None, lang: str = "es"):
    li = LANG_INSTRUCTIONS.get(lang, LANG_INSTRUCTIONS["es"])
    company_info = COMPANY_INFO_ES if lang == "es" else COMPANY_INFO_EN

    context = []
    for d, m in zip(docs, metas):
        context.append(d)
    ctx = "\n\n".join(context) if context else ""

    memory_section = ""
    if user_facts:
        facts_text = "\n".join(f"- {f}" for f in user_facts)
        memory_section = f"\n{li['memory_header']}:\n{facts_text}\n"

    topics = "\n".join(f"- {t}" for t in li["topics"])
    instructions = "\n".join(f"{i+1}. {ins}" for i, ins in enumerate(li["instructions"]))

    return f"""You are Travel Assistant, an expert in tourism in Cusco, Peru, representing TUMPERU.
{li['lang_rule']}

{li['specialist']}:
{topics}

{li['company_label']}:
{company_info}

Important instructions:
{instructions}
{memory_section}
{li['question_label']}: {query}

{li['context_label']}:
{ctx}

Answer:"""

# ==================================================
# RESPUESTAS PREDEFINIDAS
# ==================================================

RESPONSES = {
    "es": {
        "saludo": "¡Hola! Soy Travel Assistant de TUMPERU, tu guía virtual de Cusco. ¿En qué puedo ayudarte hoy? Puedo orientarte sobre tours, hoteles, gastronomía, cultura y más.",
        "despedida": "¡Hasta pronto! Que tengas un excelente viaje por Cusco. Estoy aquí cuando necesites más información.",
        "sin_docs": "Aún no tengo información específica sobre ese tema en mi base de conocimiento. ¿Podrías reformular tu pregunta o consultar sobre Machu Picchu, el Valle Sagrado o recomendaciones generales para Cusco?",
        "error": "Hubo un problema procesando tu consulta. Por favor, intenta de nuevo o reformula tu pregunta.",
        "empresa": (
            "TUMPERU es una empresa especializada en consultoría, capacitación y asesoría empresarial.\n\n"
            "📋 Razón Social: TURPO PANTIGOSO MARY CARMEN\n"
            "🔢 RUC: 10743880728\n"
            "🏢 Dirección: Barrio Profesional, Edificio Ecological Profesional, Piso 2\n"
            "📞 Contacto: 907775337\n"
            "💼 Actividad: Consultoría de gestión y servicios empresariales (CIIU 7020)\n\n"
            "🎯 Misión: Brindar servicios profesionales e integrales de consultoría, capacitación y asesoría contable, financiera y empresarial, superando las expectativas de los clientes con altos estándares de calidad y confianza.\n\n"
            "🌟 Visión: Ser la marca líder en asesoría y soluciones empresariales en la Región Sur del país, contribuyendo con la formalización y el desarrollo sostenible de las empresas.\n\n"
            "💡 Valores: Confianza · Innovación · Trabajo en Equipo · Empatía · Servicio · Puntualidad · Disciplina"
        ),
    },
    "en": {
        "saludo": "Hello! I'm Travel Assistant from TUMPERU, your virtual guide to Cusco. How can I help you today? I can provide information on tours, hotels, restaurants, culture and more.",
        "despedida": "Farewell! Have a wonderful trip to Cusco. I'm here whenever you need more information.",
        "sin_docs": "I don't have specific information on that topic yet. Could you rephrase your question or ask about Machu Picchu, the Sacred Valley, or general Cusco recommendations?",
        "error": "There was a problem processing your query. Please try again or rephrase your question.",
        "empresa": (
            "TUMPERU is a company specializing in consulting, training and business advisory services.\n\n"
            "📋 Legal Name: TURPO PANTIGOSO MARY CARMEN\n"
            "🔢 Tax ID (RUC): 10743880728\n"
            "🏢 Address: Barrio Profesional, Ecological Professional Building, 2nd Floor\n"
            "📞 Contact: 907775337\n"
            "💼 Activity: Management consulting and business services (CIIU 7020)\n\n"
            "🎯 Mission: Provide comprehensive professional consulting, training, accounting, financial and business advisory services, exceeding client expectations with quality and trust.\n\n"
            "🌟 Vision: Be the leading brand in advisory and business solutions in the Southern Region of Peru, contributing to business formalization and sustainable development.\n\n"
            "💡 Values: Trust · Innovation · Teamwork · Empathy · Service · Punctuality · Discipline"
        ),
    },
}

# ==================================================
# ENDPOINTS
# ==================================================

@router.get("/status")
def get_status():
    """Estado de salud del chatbot (sin información técnica interna)"""
    return {
        "status": "online",
        "ready": EMB is not None and kb is not None,
    }


@router.post("/ask")
def ask(body: AskReq):
    """Endpoint principal para consultar al chatbot"""
    lang = body.lang if body.lang in RESPONSES else "es"
    msgs = RESPONSES[lang]

    intent = detect_intent(body.query)

    if intent == "saludo":
        return {"intent": intent, "answer": msgs["saludo"], "sources": []}

    if intent == "despedida":
        return {"intent": intent, "answer": msgs["despedida"], "sources": []}

    if intent == "empresa":
        return {"intent": intent, "answer": msgs["empresa"], "sources": []}

    docs, metas = query_kb(body.query, body.top_k)

    if not docs or len(docs) == 0:
        return {"intent": "consulta", "answer": msgs["sin_docs"], "sources": []}

    user_facts = get_recent_facts(body.user_id, limit=5)
    prompt = build_prompt(body.query, docs, metas, user_facts=user_facts, lang=lang)
    answer = call_ollama(prompt)

    if not answer:
        answer = msgs["error"]

    return {"intent": intent, "answer": answer, "sources": []}


@router.post("/mem/fact")
def save_fact(data: MemFact):
    """Guarda un hecho en la memoria del usuario"""
    add_fact(data.user_id, data.fact_text)
    return {"ok": True}


@router.post("/mem/episode")
def save_episode(data: MemEpisode):
    """Guarda un episodio en la memoria del usuario"""
    add_episode(data.user_id, data.title, data.details, data.timestamp)
    return {"ok": True}


@router.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    """Identifica un lugar turístico en una imagen"""
    try:
        from PIL import Image as PILImage
        from .vision import model as vision_model, clases, preprocess_image

        if vision_model is None:
            import random
            lugares = ["machupicchu", "sacsayhuaman", "qorikancha", "moray",
                       "salineras", "tipon", "7colores", "laguna_huamantay"]
            clase = random.choice(lugares)
            return {
                "success": True,
                "clase": clase,
                "confidence": round(random.uniform(70, 99), 2),
                "top_predictions": [
                    {"clase": clase, "score": random.uniform(0.7, 0.99)},
                    {"clase": random.choice(lugares), "score": random.uniform(0.01, 0.2)},
                ],
                "mode": "test"
            }

        image = PILImage.open(file.file)
        img = preprocess_image(image)
        prediction = vision_model.predict(img, verbose=0)[0]
        idx = int(np.argmax(prediction))
        confidence = float(prediction[idx])
        top_idx = np.argsort(prediction)[::-1][:5]

        return {
            "success": True,
            "clase": clases[idx] if idx < len(clases) else "desconocido",
            "confidence": round(confidence * 100, 2),
            "top_predictions": [
                {"clase": clases[i] if i < len(clases) else "unknown", "score": float(prediction[i])}
                for i in top_idx
            ],
            "identified": confidence > 0.5,
            "suggestions": ["Intenta con otra foto"] if confidence < 0.5 else []
        }

    except ImportError:
        import random
        lugares = ["machupicchu", "sacsayhuaman", "qorikancha", "moray",
                   "salineras", "tipon", "7colores", "laguna_huamantay"]
        clase = random.choice(lugares)
        return {
            "success": True,
            "clase": clase,
            "confidence": round(random.uniform(70, 99), 2),
            "top_predictions": [
                {"clase": clase, "score": random.uniform(0.7, 0.99)},
                {"clase": random.choice(lugares), "score": random.uniform(0.01, 0.2)},
            ],
            "mode": "test"
        }

    except Exception as e:
        return {"success": False, "error": str(e), "identified": False}


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Sube un PDF a la base de documentos"""
    # Validar tipo de archivo
    allowed_types = {"application/pdf"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")

    # Leer contenido y validar tamaño
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Archivo demasiado grande (máximo 5 MB)")

    # Sanitizar nombre de archivo — previene path traversal
    safe_filename = os.path.basename(file.filename or "document.pdf")
    if not safe_filename.lower().endswith(".pdf"):
        safe_filename += ".pdf"

    os.makedirs(DOCS_PATH, exist_ok=True)
    file_path = os.path.join(DOCS_PATH, safe_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    return {"ok": True, "filename": safe_filename}
