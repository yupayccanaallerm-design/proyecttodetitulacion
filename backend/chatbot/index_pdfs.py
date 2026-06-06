import os
import glob
import re
from pypdf import PdfReader
import chromadb
from sentence_transformers import SentenceTransformer
import numpy as np

# ==========================================
# CONFIGURACIÓN - RUTAS CORREGIDAS
# ==========================================

# Ruta exacta a tu carpeta docs
DOCS_PATH = r"C:\Users\User\Documents\Githab\Titulacion\proyecttodetitulacion\backend\chatbot\docs"

# Ruta para la base de conocimiento (se creará automáticamente)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KB_PATH = os.path.join(BASE_DIR, "kb_store")

CHUNK_SIZE = 700
OVERLAP = 120

print(f"📂 Buscando PDFs en: {DOCS_PATH}")
print(f"💾 Base de conocimiento en: {KB_PATH}")

# Verificar que la carpeta existe
if not os.path.exists(DOCS_PATH):
    print(f"❌ ERROR: La carpeta {DOCS_PATH} no existe")
    print("Creando carpeta...")
    os.makedirs(DOCS_PATH, exist_ok=True)
    exit(1)

# Modelo multilingüe (español incluido)
print("🔄 Cargando modelo de embeddings...")
EMB = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

# Base vectorial
client = chromadb.PersistentClient(path=KB_PATH)

# Eliminar colección anterior si existe para evitar conflictos
try:
    client.delete_collection("turismo_cusco_kb")
    print("🔄 Colección anterior eliminada")
except:
    pass

# Crear nueva colección
kb = client.get_or_create_collection(
    "turismo_cusco_kb",
    metadata={"hnsw:space": "cosine"}
)

print("✅ Base de datos lista")

# ==========================================
# LIMPIEZA DE TEXTO
# ==========================================

def _unsplit_spaced_words(text: str) -> str:
    """
    Convierte:
    M A C H U  P I C C H U
    en:
    MACHU PICCHU
    """
    # Patrón mejorado para letras separadas
    pattern = r'\b([A-Za-zÁÉÍÓÚÑÜáéíóúñü])\s+(?=[A-Za-zÁÉÍÓÚÑÜáéíóúñü])'
    text = re.sub(pattern, r'\1', text)
    return text

def clean_pdf_text(text: str) -> str:
    if not text:
        return ""

    text = text.replace("\r", "\n")
    
    # Une palabras partidas por guión
    text = re.sub(r"-\s*\n\s*", "", text)
    
    # Normaliza saltos de línea
    text = re.sub(r"\n+", "\n", text)
    
    # Corrige letras separadas
    text = _unsplit_spaced_words(text)
    
    # Espacios múltiples
    text = re.sub(r"[ \t]+", " ", text)
    
    return text.strip()

# ==========================================
# CHUNKS
# ==========================================

def chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = OVERLAP):
    text = " ".join((text or "").split())
    
    if not text:
        return []
    
    chunks = []
    step = max(1, size - overlap)
    
    i = 0
    while i < len(text):
        chunk = text[i:i + size]
        # Intentar cortar en un punto razonable (espacio o punto)
        if len(chunk) == size and i + size < len(text):
            last_space = chunk.rfind(' ')
            last_dot = chunk.rfind('.')
            cut_pos = max(last_space, last_dot)
            if cut_pos > size // 2:
                chunk = chunk[:cut_pos]
                i += cut_pos
            else:
                i += size
        else:
            i += size
        chunks.append(chunk)
    
    return chunks

# ==========================================
# EXTRACCIÓN PDF
# ==========================================

def extract_text_from_pdf(path: str):
    try:
        reader = PdfReader(path)
        pages = []
        
        for page_num, page in enumerate(reader.pages):
            raw = page.extract_text() or ""
            cleaned = clean_pdf_text(raw)
            if cleaned:
                pages.append(cleaned)
            print(f"   Página {page_num + 1}: {len(cleaned)} caracteres")
        
        return "\n".join(pages)
    
    except Exception as e:
        print(f"[ERROR] No pude leer {path}")
        print(e)
        return ""

# ==========================================
# EMBEDDINGS
# ==========================================

def embed_texts(texts):
    embeddings = EMB.encode(
        texts,
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=True
    )
    
    return [emb.astype(np.float32).tolist() for emb in embeddings]

# ==========================================
# INDEXACIÓN
# ==========================================

def index_pdf(pdf_path):
    filename = os.path.basename(pdf_path)
    print(f"\n📄 Procesando: {filename}")
    
    text = extract_text_from_pdf(pdf_path)
    
    if not text.strip():
        print(f"[AVISO] {filename} parece escaneado o vacío.")
        return 0
    
    print(f"   Texto extraído: {len(text)} caracteres")
    
    chunks = chunk_text(text)
    
    if not chunks:
        print(f"[AVISO] Sin chunks en {filename}")
        return 0
    
    print(f"   Generando {len(chunks)} chunks...")
    
    ids = []
    docs = []
    metas = []
    
    for idx, chunk in enumerate(chunks):
        ids.append(f"{filename.replace('.pdf', '')}-{idx}")
        docs.append(chunk)
        metas.append({
            "source": filename,
            "chunk": idx,
            "category": "turismo",
            "region": "Cusco"
        })
    
    print(f"   Generando embeddings...")
    embeddings = embed_texts(docs)
    
    # Agregar a la base de datos
    try:
        kb.add(
            ids=ids,
            documents=docs,
            embeddings=embeddings,
            metadatas=metas
        )
        print(f"✅ {filename} indexado correctamente ({len(chunks)} chunks)")
    except Exception as e:
        print(f"❌ Error al indexar {filename}: {e}")
        return 0
    
    return len(chunks)

# ==========================================
# VERIFICACIÓN
# ==========================================

def verificar_kb():
    """Verificar que la base de conocimiento se creó correctamente"""
    try:
        total = kb.count()
        print(f"\n{'='*50}")
        print(f"📊 ESTADÍSTICAS FINALES:")
        print(f"   Total documentos en KB: {total}")
        
        if total > 0:
            # Mostrar un ejemplo
            resultados = kb.get(limit=1)
            print(f"\n📄 Ejemplo de documento indexado:")
            print(f"   Fuente: {resultados['metadatas'][0].get('source', 'N/A')}")
            print(f"   Contenido: {resultados['documents'][0][:150]}...")
        print(f"{'='*50}")
        return total
    except Exception as e:
        print(f"❌ Error verificando KB: {e}")
        return 0

# ==========================================
# PRUEBA DE CONSULTA
# ==========================================

def probar_consulta(query="recomendaciones cusco"):
    """Prueba la base de conocimiento con una consulta"""
    print(f"\n🧪 Probando consulta: '{query}'")
    
    try:
        # Generar embedding de la consulta
        query_embedding = EMB.encode([query], normalize_embeddings=True)
        
        # Buscar en la KB
        resultados = kb.query(
            query_embeddings=query_embedding.tolist(),
            n_results=3
        )
        
        if resultados['documents'][0]:
            print(f"✅ Se encontraron {len(resultados['documents'][0])} resultados")
            for i, doc in enumerate(resultados['documents'][0]):
                print(f"\n   Resultado {i+1}:")
                print(f"   Fuente: {resultados['metadatas'][0][i].get('source', 'N/A')}")
                print(f"   Texto: {doc[:200]}...")
        else:
            print("⚠️ No se encontraron resultados")
            
    except Exception as e:
        print(f"❌ Error en consulta: {e}")

# ==========================================
# MAIN
# ==========================================

def main():
    print("="*50)
    print("INDEXADOR DE PDFs PARA CHATBOT")
    print("="*50)
    
    # Buscar PDFs en la carpeta docs
    pdfs = glob.glob(os.path.join(DOCS_PATH, "*.pdf"))
    txts = glob.glob(os.path.join(DOCS_PATH, "*.txt"))
    
    print(f"\n📁 Archivos encontrados:")
    print(f"   PDFs: {len(pdfs)}")
    print(f"   TXTs: {len(txts)}")
    
    if not pdfs and not txts:
        print("\n❌ No hay archivos PDF o TXT en la carpeta docs/")
        print(f"   Por favor, coloca archivos en: {DOCS_PATH}")
        return
    
    total_chunks = 0
    
    # Procesar PDFs
    for pdf in pdfs:
        total_chunks += index_pdf(pdf)
    
    # Procesar TXTs (si los hay)
    for txt in txts:
        print(f"\n📄 Procesando TXT: {os.path.basename(txt)}")
        with open(txt, 'r', encoding='utf-8') as f:
            text = f.read()
        
        chunks = chunk_text(text)
        if chunks:
            ids = []
            docs = []
            metas = []
            for idx, chunk in enumerate(chunks):
                ids.append(f"{os.path.basename(txt).replace('.txt', '')}-{idx}")
                docs.append(chunk)
                metas.append({
                    "source": os.path.basename(txt),
                    "chunk": idx,
                    "category": "turismo",
                    "region": "Cusco"
                })
            
            embeddings = embed_texts(docs)
            try:
                kb.add(ids=ids, documents=docs, embeddings=embeddings, metadatas=metas)
                total_chunks += len(chunks)
                print(f"✅ TXT indexado: {len(chunks)} chunks")
            except Exception as e:
                print(f"❌ Error: {e}")
    
    print("\n" + "="*50)
    print("RESUMEN FINAL")
    print("="*50)
    print(f"✅ Archivos procesados: {len(pdfs) + len(txts)}")
    print(f"✅ Chunks indexados: {total_chunks}")
    
    verificar_kb()
    probar_consulta()
    
    print("\n🎯 ¡Base de conocimiento lista!")
    print("   Reinicia el backend y prueba el chatbot.")

if __name__ == "__main__":
    main()