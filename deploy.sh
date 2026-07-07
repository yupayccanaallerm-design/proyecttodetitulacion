#!/bin/bash
# ══════════════════════════════════════════════════════════════════
#  deploy.sh — Script de actualización en Hostinger VPS
#  Ejecutar en el servidor: bash /root/proyecttodetitulacion/deploy.sh
# ══════════════════════════════════════════════════════════════════

set -e  # Detener si cualquier comando falla

PROJECT_DIR="/root/proyecttodetitulacion"
FRONTEND_DIR="$PROJECT_DIR/frontend"
VENV_DIR="$PROJECT_DIR/venv"

echo "╔══════════════════════════════════════════╗"
echo "║   Travel Assistant — Deploy en VPS       ║"
echo "╚══════════════════════════════════════════╝"

# ── 1. Bajar cambios del repositorio ──────────────────────────────
echo ""
echo "▶ [1/5] Bajando cambios de GitHub..."
cd "$PROJECT_DIR"
git pull origin main
echo " Git actualizado"

# ── 2. Instalar dependencias Python (si cambiaron) ────────────────
echo ""
echo "▶ [2/5] Actualizando dependencias Python..."
source "$VENV_DIR/bin/activate"
pip install -r backend/requirements.txt --quiet
echo " Dependencias Python OK"

# ── 3. Build del frontend React ───────────────────────────────────
echo ""
echo "▶ [3/5] Construyendo frontend React..."
cd "$FRONTEND_DIR"
npm install --silent
npm run build
echo "✅ Frontend build OK → $FRONTEND_DIR/dist"

# ── 4. Copiar y recargar Nginx ────────────────────────────────────
echo ""
echo "▶ [4/5] Actualizando configuración Nginx..."
cd "$PROJECT_DIR"
sudo cp nginx.travel.conf /etc/nginx/sites-available/travel.tumperusoft.com

# Crear symlink si no existe
if [ ! -f /etc/nginx/sites-enabled/travel.tumperusoft.com ]; then
    sudo ln -sf /etc/nginx/sites-available/travel.tumperusoft.com \
                /etc/nginx/sites-enabled/travel.tumperusoft.com
    echo "  → Symlink creado en sites-enabled"
fi

sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx recargado"

# ── 5. Reiniciar el backend FastAPI ───────────────────────────────
echo ""
echo "▶ [5/5] Reiniciando backend FastAPI..."

# Si está corriendo como servicio systemd:
if systemctl is-active --quiet travel-assistant; then
    sudo systemctl restart travel-assistant
    echo "✅ Servicio travel-assistant reiniciado"
else
    echo "  ⚠️  Servicio travel-assistant no está activo como servicio."
    echo "     Instálalo con:"
    echo "     sudo cp $PROJECT_DIR/travel-assistant.service /etc/systemd/system/"
    echo "     sudo systemctl daemon-reload"
    echo "     sudo systemctl enable travel-assistant"
    echo "     sudo systemctl start travel-assistant"
fi

# ── Verificación final ────────────────────────────────────────────
echo ""
echo "── Verificando servicios ──────────────────────────────────────"
sleep 2

echo -n "  Backend /health : "
curl -s http://127.0.0.1:8000/health || echo "❌ No responde"

echo -n "  Chatbot /status : "
curl -s http://127.0.0.1:8000/chatbot/status || echo "❌ No responde"

echo -n "  Recomendar status: "
curl -s http://127.0.0.1:8000/recomendar/status || echo "❌ No responde"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Deploy completado                      ║"
echo "║   https://travel.tumperusoft.com         ║"
echo "╚══════════════════════════════════════════╝"
