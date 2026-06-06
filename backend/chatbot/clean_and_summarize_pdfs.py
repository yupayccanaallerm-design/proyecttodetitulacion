# clean_and_summarize_pdfs.py
# Versión mejorada - Guarda DIRECTAMENTE en la carpeta docs

import os, re, sys, time, json
from typing import List, Tuple
from pypdf import PdfReader
import requests
import logging

# ========= CONFIGURACIÓN =========
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# --- NUEVA RUTA: Guardar DIRECTAMENTE en docs ---
DOCS_DIR = r"C:\Users\User\Documents\Githab\Titulacion\proyecttodetitulacion\backend\chatbot\docs"
RAW_DIR = os.path.join(BASE_DIR, "raw_pdfs")

# Crear carpetas si no existen
os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(RAW_DIR, exist_ok=True)

PROGRESS_FILE = os.path.join(BASE_DIR, "progress.json")

OLLAMA_URL = os.environ.get(
    "OLLAMA_URL",
    "http://127.0.0.1:11434/api/generate"
)
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3")
TEMP = float(os.environ.get("OLLAMA_TEMP", "0.3"))
TIMEOUT = int(os.environ.get("OLLAMA_TIMEOUT", "600"))
MAX_RETRIES = 2

CHUNK_CHARS = int(os.environ.get("CLEAN_CHUNK_CHARS", "1500"))
CHUNK_OVERLAP = int(os.environ.get("CLEAN_CHUNK_OVERLAP", "200"))
MIN_CHUNK_SIZE = 100

# ========= PROMPT =========
PROMPT = """
Eres un especialista en turismo de Perú con experiencia en atención a turistas.

Extrae SOLAMENTE información útil para un chatbot turístico.

Información relevante:
- Lugares turísticos, sitios arqueológicos, museos, iglesias, parques
- Montañas, lagunas, rutas de trekking, tours, actividades de aventura
- Gastronomía, restaurantes, hoteles, hospedajes
- Transporte, horarios, precios y tarifas
- Recomendaciones de viaje, clima, festividades
- Cultura, historia, consejos de seguridad

Elimina:
- Índices, portadas, publicidad, créditos, páginas legales
- Información repetida o sin valor turístico

Resume en viñetas claras y fáciles de entender.

Si NO hay información turística útil responde EXACTAMENTE: NO_INFO

Texto:
-------------------
{chunk}
-------------------

Respuesta:
"""

# ========= LOGGING =========
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# ========= UTILIDADES =========
def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_progress(data):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def _unsplit_spaced_words(text: str) -> str:
    return re.sub(r"(?<!\w)([A-Za-zÁÉÍÓÚÑÜáéíóúñü])\s+([A-Za-zÁÉÍÓÚÑÜáéíóúñü]+)", 
                  lambda m: m.group(0).replace(" ", ""), text)

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\r", "\n")
    text = re.sub(r"-\s*\n\s*", "", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = _unsplit_spaced_words(text)
    text = re.sub(r"\n{2,}", "\n", text)
    text = re.sub(r"\s*\n\s*", "\n", text)
    return text.strip()

def extract_pdf_with_pages(path: str) -> List[Tuple[int, str]]:
    pages = []
    try:
        reader = PdfReader(path)
        for i, page in enumerate(reader.pages, 1):
            try:
                txt = page.extract_text() or ""
            except Exception:
                txt = ""
            pages.append((i, clean_text(txt)))
    except Exception as e:
        logger.error(f"Error leyendo {path}: {e}")
    return pages

def make_chunks(pages: List[Tuple[int, str]], size=CHUNK_CHARS, overlap=CHUNK_OVERLAP) -> List[Tuple[str, int, int]]:
    full_text = ""
    offsets = []
    for pg, txt in pages:
        offsets.append((pg, len(full_text)))
        full_text += txt + "\n"
    
    chunks = []
    i = 0
    step = max(1, size - overlap)
    while i < len(full_text):
        chunk = full_text[i:i+size].strip()
        if len(chunk) >= MIN_CHUNK_SIZE:
            start_pg = min([pg for pg, off in offsets if off <= i], default=1)
            end_pg = max([pg for pg, off in offsets if off <= i+size], default=pages[-1][0])
            chunks.append((chunk, start_pg, end_pg))
        i += step
    return chunks

def ask_llm(chunk: str, chunk_num: int, total_chunks: int) -> str:
    for attempt in range(MAX_RETRIES):
        try:
            logger.info(f"📤 Enviando chunk {chunk_num}/{total_chunks}, intento {attempt+1}")
            r = requests.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": PROMPT.format(chunk=chunk[:4000]),
                    "stream": False,
                    "options": {"temperature": TEMP},
                },
                timeout=TIMEOUT
            )
            if r.status_code == 200:
                return r.json().get("response", "").strip()
            else:
                logger.warning(f"HTTP {r.status_code} chunk {chunk_num}")
        except requests.exceptions.Timeout:
            logger.warning(f"⏰ Timeout chunk {chunk_num}, intento {attempt+1}")
        except Exception as e:
            logger.error(f"❌ Error chunk {chunk_num}: {e}")
        time.sleep(5)
    return ""

def guardar_en_docs(base_title: str, sections: List[Tuple[str, int, int]]):
    """Guarda DIRECTAMENTE en la carpeta docs sin usar clean_out"""
    
    safe_title = re.sub(r'[<>:"/\\|?*]', "_", base_title)
    
    # Guardar como TXT (mejor para el chatbot)
    txt_path = os.path.join(DOCS_DIR, f"{safe_title}.txt")
    
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(f"{base_title}\n")
        f.write("="*len(base_title) + "\n\n")
        
        for i, (s, pmin, pmax) in enumerate(sections, 1):
            if not s or s == "NO_INFO":
                continue
            
            f.write(f"SECCIÓN {i} (Páginas {pmin}-{pmax})\n")
            f.write("-" * 40 + "\n")
            
            for line in s.split("\n"):
                if line.strip() and line.strip() != "NO_INFO":
                    # Limpiar la línea
                    line_clean = line.strip()
                    if line_clean.startswith('-'):
                        f.write(f"{line_clean}\n")
                    else:
                        f.write(f"• {line_clean}\n")
            f.write("\n")
    
    logger.info(f"✅ Guardado en docs: {safe_title}.txt")
    return txt_path

# ========= PROCESO PRINCIPAL =========
def process_pdf(path: str, progress: dict):
    name = os.path.basename(path)
    base, _ = os.path.splitext(name)
    
    logger.info(f"\n📖 Procesando: {name}")
    
    pages = extract_pdf_with_pages(path)
    if not pages:
        logger.warning(f"❌ No se pudo extraer texto de {name}")
        return False
    
    chunks = make_chunks(pages)
    total_chunks = len(chunks)
    logger.info(f"📄 {total_chunks} chunks generados")
    
    sections = progress.get(base, {}).get("sections", [])
    completed = set(progress.get(base, {}).get("completed_chunks", []))
    
    for idx, (chunk, pmin, pmax) in enumerate(chunks, 1):
        if idx in completed:
            logger.info(f"⏩ Saltando chunk {idx}/{total_chunks} (ya procesado)")
            continue
        
        resp = ask_llm(chunk, idx, total_chunks)
        if resp and resp != "NO_INFO":
            sections.append((resp, pmin, pmax))
            logger.info(f"✅ Chunk {idx} procesado - {len(resp)} caracteres")
        else:
            logger.info(f"⚠️ Chunk {idx} - Sin información relevante")
        
        completed.add(idx)
        
        # Guardar progreso
        progress[base] = {"sections": sections, "completed_chunks": list(completed)}
        save_progress(progress)
    
    if not sections:
        sections = [("No se encontró información turística relevante.", 1, pages[-1][0])]
    
    # Guardar directamente en docs
    guardar_en_docs(base, sections)
    return True

# ========= LIMPIEZA DE CLEAN_OUT =========
def limpiar_clean_out():
    """Opcional: elimina la carpeta clean_out si existe"""
    clean_out_path = os.path.join(BASE_DIR, "clean_out")
    if os.path.exists(clean_out_path):
        import shutil
        shutil.rmtree(clean_out_path)
        logger.info(f"🗑️ Eliminada carpeta clean_out (ya no se usa)")

# ========= MAIN =========
def main():
    print("="*60)
    print("📚 PROCESADOR DE PDFs - GUARDA DIRECTAMENTE EN docs")
    print("="*60)
    
    progress = load_progress()
    
    # Verificar carpeta raw_pdfs
    if not os.path.isdir(RAW_DIR):
        os.makedirs(RAW_DIR)
        print(f"📁 Crea una carpeta 'raw_pdfs' y coloca tus PDFs allí")
        print(f"   Ruta: {RAW_DIR}")
        return
    
    pdfs = [os.path.join(RAW_DIR, f) for f in os.listdir(RAW_DIR) if f.lower().endswith(".pdf")]
    
    if not pdfs:
        print(f"❌ No hay PDFs en {RAW_DIR}")
        print(f"   Coloca archivos PDF en esa carpeta y vuelve a ejecutar")
        return
    
    print(f"\n📄 Procesando {len(pdfs)} PDFs usando Ollama: {OLLAMA_MODEL}")
    print(f"💾 Guardando resultados en: {DOCS_DIR}")
    print("-"*60)
    
    success = 0
    for pdf in pdfs:
        if process_pdf(pdf, progress):
            success += 1
    
    print("\n" + "="*60)
    print(f"✅ PROCESAMIENTO COMPLETADO")
    print(f"   PDFs procesados: {success}/{len(pdfs)}")
    print(f"   Archivos guardados en: {DOCS_DIR}")
    print("="*60)
    
    # Mostrar archivos generados
    archivos = os.listdir(DOCS_DIR)
    print(f"\n📁 Archivos en docs/ ({len(archivos)} archivos):")
    for a in archivos[:10]:
        print(f"   - {a}")
    
    # Limpiar clean_out si existe
    limpiar_clean_out()

if __name__ == "__main__":
    main()