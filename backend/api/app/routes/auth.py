# filepath: .../routes/auth.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import secrets
import bcrypt  # <-- Importamos bcrypt nativo directamente

# IMPORTAMOS TU CONEXIÓN PROPIA
from api.database import obtener_conexion

router = APIRouter(prefix="/api", tags=["Auth"])

# Modelo de datos que espera recibir desde el formulario de React
class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(data: LoginRequest):
    conn = obtener_conexion()
    cursor = conn.cursor()
    
    try:
        # Buscar al usuario en PostgreSQL
        cursor.execute("SELECT id, nombre, email, password, rol FROM usuarios WHERE email = %s;", (data.email,))
        usuario = cursor.fetchone()
        
        # 1. Si el correo no existe en la BD
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="El correo o la contraseña son incorrectos."
            )
            
        password_bd = usuario[3]
        es_valido = False

        # 2. VERIFICACIÓN DE CONTRASEÑA CON BCRYPT NATIVO
        try:
            # Convertimos los strings a bytes (.encode('utf-8')) para que bcrypt los procese
            password_bytes = data.password.encode('utf-8')
            bd_bytes = password_bd.encode('utf-8')
            es_valido = bcrypt.checkpw(password_bytes, bd_bytes)
        except Exception:
            # Si el registro en la BD no es un hash válido (texto plano), entra aquí
            es_valido = (data.password == password_bd)

        # Si ninguna de las dos verificaciones pasa
        if not es_valido:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="El correo o la contraseña son incorrectos."
            )

        # 3. Generar el token seguro para React
        token = secrets.token_hex(40)

        return {
            "message": "¡Inicio de sesión exitoso!",
            "token": token,
            "usuario": {
                "id": usuario[0],      # <-- AGREGADO: Importante para que React use localStorage.setItem('user_id')
                "nombre": usuario[1],
                "email": usuario[2],
                "rol": usuario[4]
            }
        }

    finally:
        cursor.close()
        conn.close()