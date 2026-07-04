from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
import secrets
import bcrypt

from ...database import obtener_conexion
from ..i18n import tr
from ..security import store_token

router = APIRouter(prefix="/api", tags=["Auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(data: LoginRequest, request: Request):
    conn = obtener_conexion()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT id, nombre, email, password, rol FROM usuarios WHERE email = %s;",
            (data.email,),
        )
        usuario = cursor.fetchone()

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=tr(request, "credenciales_invalidas"),
            )

        password_bd = usuario[3]

        try:
            password_bytes = data.password.encode("utf-8")
            bd_bytes = password_bd.encode("utf-8")
            es_valido = bcrypt.checkpw(password_bytes, bd_bytes)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=tr(request, "error_autenticacion"),
            )

        if not es_valido:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=tr(request, "credenciales_invalidas"),
            )

        token = secrets.token_hex(40)
        store_token(token, usuario[0])

        return {
            "message": tr(request, "login_exitoso"),
            "token": token,
            "usuario": {
                "id": usuario[0],
                "nombre": usuario[1],
                "email": usuario[2],
                "rol": usuario[4],
            },
        }

    finally:
        cursor.close()
        conn.close()
