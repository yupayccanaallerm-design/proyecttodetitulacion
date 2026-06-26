---
name: project-travel-assistant
description: Sistema de asistencia turística para Cusco — stack FastAPI + React, análisis completo, bugs corregidos, i18n integrado al 100%
metadata:
  type: project
---

## Proyecto: Travel Assistant / SGEV — Tumperu Cusco

Stack: FastAPI (Python) + React/TypeScript + Vite + Tailwind + i18next + Ollama

### Módulos principales
- **Frontend**: React 18 + TypeScript + Vite en `/frontend/src/`
- **Backend unificado**: FastAPI en `/backend/api/app/main.py`, puerto 8000
- **Chatbot RAG**: `/backend/api/app/routes/chatbot.py` con ChromaDB + sentence-transformers
- **Recomendador**: ML con scikit-learn en `/backend/api/app/routes/recomendacion.py`
- **Visión IA**: TensorFlow/Keras en `/backend/api/app/routes/vision.py`

### i18n — Estado actual (2026-06-26): INTEGRACIÓN COMPLETA v2

**Frontend** (`/frontend/src/i18n.ts`): ES + EN, ~350+ claves
**Backend** (`/backend/api/app/i18n.py`): ES + EN con función `tr(request, key)`
**Idioma activo**: guardado en `localStorage.getItem("lang")`, al cambiar recarga la página completa (`window.location.reload()`)

#### Cambio de idioma con recarga:
- `App.tsx` → `changeLang()` guarda en `localStorage("lang")` y llama `window.location.reload()`
- `i18n.ts` → `lng: localStorage.getItem("lang") || "es"` lee el idioma persistido al iniciar

#### Nuevas claves añadidas (2026-06-26):
- `tours_duracion_dia/medio`, `tours_tag_dataset/operativo`, `tours_grupo`
- `paquetes_tag_circuito`
- `dif_baja/moderada/alta`, `tipo_arqueologico/natural/templo/destino`
- `dur_variable/1_dia/medio_dia/2_3_dias/2_3_horas/2_horas`
- `mapa_titulo/clic/recomendacion/compatibilidad`
- `recomendador.badge/addBtn/mapTitle/mapCount/defaultDestino/tipoDestino/tipoRecomendado/tourDefault/timeout`
- `recomendador.fields.budget/days/tripType/transport`

#### Archivos i18n corregidos (todos los textos hardcodeados eliminados):
- `App.tsx` — changeLang con reload, tooltip admin, concierge title
- `Login.tsx` — labels, errores, botones
- `ChatBot.tsx` — alert voz, error conexión, mensaje contexto inicial
- `AdminDashboard.tsx` — menu items, badges, logout, panel operativo
- `AdminTours.tsx` — labels, opciones zona, botones, alerts
- `AdminPaquetes.tsx` — labels, opciones perfil/duración, botones
- `AdminReservas.tsx` — estados, filtros, labels, fechas
- `GestionUsuarios.tsx` — pestañas, labels, roles, modal, confirms
- `ResumenItinerario.tsx` — textos, botones, nivel exigencia
- `Tours.tsx` — variable `t` renombrada a `tourItem` (evita shadow), duration/tags traducidos
- `Paquetes.tsx` — tags "Circuito Completo" y "Dataset Activo" traducidos
- `Recomendador.tsx` — INFO_DESTINOS con claves i18n, labels avanzados, botón Agregar, mapa header
- `MapaDestinos.tsx` — header, popup "Recomendación"/"Compatibilidad", props titleOverride/subtitleOverride

#### Traducción de contenido dinámico de BD (2026-06-26):
- `backend/api/app/i18n.py` — función `translate_content(text, lang)` usando `deep-translator` (GoogleTranslator)
- `backend/routes/tours.py` → `GET /api/tours?lang=en` traduce el campo `descripcion` al vuelo
- `backend/routes/paquetes.py` → `GET /api/paquetes?lang=en` traduce el campo `descripcion_base` al vuelo
- `Tours.tsx` y `Paquetes.tsx` pasan `?lang=${i18n.language}` en el fetch
- Librería `deep-translator==1.11.4` instalada en el entorno Python

#### Backend corregidos:
- `chatbot.py`, `paquetes.py`, `reservas.py`, `usuarios.py` — errores y respuestas traducidos

**Why:** La tesis requería cobertura completa de i18n para demostrar sistema multilingüe.
**How to apply:** Usar siempre `t("clave")` en frontend y `tr(request, "clave")` en backend. Nunca strings hardcodeados en español/inglés visibles al usuario.
