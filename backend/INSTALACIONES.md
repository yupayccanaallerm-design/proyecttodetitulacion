# Proyecto Travel Assistant - Instalaciones

## Backend - Cómo iniciar el servidor

```bash
# Desde la carpeta backend/api/  (IMPORTANTE: ejecutar desde aquí)
cd backend/api
uvicorn app.main:app --reload
```

> El servidor queda disponible en: http://127.0.0.1:8000

**¿Por qué desde `backend/api/`?**
- `main.py` usa imports relativos (`from .routes.*`) que requieren que `app` sea un paquete.
- Los routes usan `from database import obtener_conexion`, que solo encuentra `database.py` si `backend/api/` está en el Python path.

---

## Dependencias Python

```
fastapi
uvicorn
mysql-connector-python
chromadb
sentence-transformers
requests
pypdf
pillow
numpy
tensorflow
```

## IA - Ollama

```bash
# Instalar e iniciar Ollama
ollama serve
ollama pull llama3
```

URL local: http://127.0.0.1:11434

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

> Disponible en: http://localhost:5173
