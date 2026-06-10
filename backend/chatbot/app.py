"""
⚠️ ARCHIVO DESHABILITADO - Chatbot unificado en backend/api/app/main.py

Este archivo es una implementación DUPLICADA del chatbot que competía por el puerto 8000
con el servidor principal.

Para evitar conflictos y asegurar la integración de los 3 módulos (Chatbot + Recomendador + Visión),
USA el servidor unificado:

    uvicorn backend.api.app.main:app --reload --port 8000

El archivo completo original se mantiene como referencia pero no debe ejecutarse directamente.
"""

import sys
import os

print("=" * 70)
print("  ⛔ CHATBOT STANDALONE DESHABILITADO")
print("=" * 70)
print()
print("  Este archivo (backend/chatbot/app.py) es una versión duplicada del chatbot.")
print()
print("  ✅ Usa el servidor UNIFICADO que integra todos los módulos:")
print()
print("     uvicorn backend.api.app.main:app --reload --port 8000")
print()
print("  Este servidor incluye:")
print("    - 🤖 Chatbot con RAG (via router /chatbot)")
print("    - 🎯 Recomendador de destinos (via router /recomendacion)")
print("    - 📸 Reconocimiento de imágenes (via router /vision)")
print("    - 🔗 Endpoints de integración cruzada entre módulos")
print()
print("=" * 70)

# Salir inmediatamente para evitar que el servidor se inicie
sys.exit(0)

# El código original del chatbot está disponible en:
# backend/api/app/routes/chatbot.py
