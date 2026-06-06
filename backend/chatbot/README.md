# MunayPalta Voice - Chatbot (V1, local y gratis)

Asistente conversacional en español con voz, RAG (usa tus PDFs con citas) y memoria básica. 
Corre local en tu PC (8 GB), sin costos. Frontend elegante, servido por FastAPI.

## 0) Requisitos
- Python 3.10+ (recomendado 3.11)
- Navegador Chrome/Edge (para STT/TTS)
- Ollama (modelo local): https://ollama.com  -> luego: `ollama pull phi3`

## 1) Instalar dependencias
```
pip install -r requirements.txt
```

## 2) Agrega tus PDFs
Copia tus documentos a la carpeta: `./docs/`  
Si un PDF es escaneado y no tiene texto, aplica OCR (Tesseract) o consigue una version con texto.

## 3) Indexar PDFs
```
python index_pdfs.py
```

## 4) Ejecutar
Primero, asegura Ollama activo y modelo descargado:
```
ollama serve
# en otra terminal
ollama pull phi3
```
Luego:
```
uvicorn app:app --reload
```
Abre: http://localhost:8000

## 5) Probar
- Mantén presionado 🎤 y di "hola" -> responde en voz y texto.
- Pregunta: "sintomas de antracnosis" -> si indexaste PDFs, verás citas.
- "recuerda que prefiero respuestas cortas" -> guarda fact.

## 6) Estructura
```
MunayPaltaVoice/
  app.py
  index_pdfs.py
  requirements.txt
  /frontend
    index.html
    script.js
    styles.css
  /docs
  /kb_store
  /data/memory.sqlite
```

## 7) Notas
- Embeddings: fastembed (BAAI/bge-m3).
- Vector DB: chromadb 0.4.24.
- Voz: TTS/STT del navegador.
- Todo local, sin costos.
