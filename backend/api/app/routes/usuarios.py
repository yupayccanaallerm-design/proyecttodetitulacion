# filepath: .../routes/usuarios.py
import bcrypt
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from typing import Optional
from ...database import obtener_conexion
from ..i18n import tr

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])


class CrearUsuarioRequest(BaseModel):
    nombre: str
    email: str
    password: str
    rol: str = "admin"


class ActualizarPerfilRequest(BaseModel):
    id_usuario: int
    nombre: str
    email: str


class CambiarPasswordRequest(BaseModel):
    id_usuario: int
    password_actual: str
    password_nueva: str


class EditarUsuarioRequest(BaseModel):
    id_usuario: int
    nombre: str
    email: str
    rol: str
    password: Optional[str] = None


@router.post("/crear")
async def crear_usuario(data: CrearUsuarioRequest, request: Request):
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        password_encriptada = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        cursor.execute(
            """
            INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at)
            VALUES (%s, %s, %s, %s, NOW(), NOW()) RETURNING id;
            """,
            (data.nombre, data.email, password_encriptada, data.rol)
        )
        nuevo_id = cursor.fetchone()[0]
        conn.commit()

        return {"message": tr(request, "usuario_creado"), "id_usuario": nuevo_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"{tr(request, 'error_crear_usuario')}: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.put("/actualizar-perfil")
async def actualizar_perfil(data: ActualizarPerfilRequest, request: Request):
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            UPDATE usuarios
            SET nombre = %s, email = %s, updated_at = NOW()
            WHERE id = %s;
            """,
            (data.nombre, data.email, data.id_usuario)
        )
        conn.commit()
        return {"message": tr(request, "perfil_actualizado")}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"{tr(request, 'error_actualizar')}: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.put("/cambiar-password")
async def cambiar_password(data: CambiarPasswordRequest, request: Request):
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT password, email FROM usuarios WHERE id = %s;", (data.id_usuario,))
        usuario = cursor.fetchone()

        if not usuario:
            raise HTTPException(status_code=400, detail=tr(request, "usuario_no_encontrado"))

        password_bd = usuario[0]

        if password_bd.startswith("$2y$"):
            password_bd = password_bd.replace("$2y$", "$2b$", 1)

        valida = False
        try:
            valida = bcrypt.checkpw(data.password_actual.encode('utf-8'), password_bd.encode('utf-8'))
        except Exception:
            valida = (data.password_actual == password_bd)

        if not valida:
            raise HTTPException(status_code=400, detail=tr(request, "password_incorrecta"))

        salt = bcrypt.gensalt()
        nueva_encriptada = bcrypt.hashpw(data.password_nueva.encode('utf-8'), salt).decode('utf-8')

        cursor.execute(
            "UPDATE usuarios SET password = %s, updated_at = NOW() WHERE id = %s;",
            (nueva_encriptada, data.id_usuario)
        )
        conn.commit()
        return {"message": tr(request, "password_cambiada")}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"{tr(request, 'error_detalle')}: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.put("/editar")
async def editar_usuario(data: EditarUsuarioRequest, request: Request):
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        if data.password and data.password.strip() != "":
            salt = bcrypt.gensalt()
            password_encriptada = bcrypt.hashpw(data.password.encode('utf-8'), salt).decode('utf-8')
            cursor.execute(
                """
                UPDATE usuarios
                SET nombre = %s, email = %s, rol = %s, password = %s, updated_at = NOW()
                WHERE id = %s;
                """,
                (data.nombre, data.email, data.rol, password_encriptada, data.id_usuario)
            )
        else:
            cursor.execute(
                """
                UPDATE usuarios
                SET nombre = %s, email = %s, rol = %s, updated_at = NOW()
                WHERE id = %s;
                """,
                (data.nombre, data.email, data.rol, data.id_usuario)
            )

        conn.commit()
        return {"message": tr(request, "usuario_editado")}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"{tr(request, 'error_editar_usuario')}: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.delete("/eliminar/{id_usuario}")
async def eliminar_usuario(id_usuario: int, request: Request):
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM usuarios WHERE id = %s;", (id_usuario,))
        conn.commit()
        return {"message": tr(request, "usuario_eliminado")}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"{tr(request, 'error_eliminar_usuario')}: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.get("")
async def listar_usuarios(request: Request):
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT id, nombre, email, rol, created_at
            FROM usuarios
            ORDER BY id ASC;
            """
        )
        usuarios_bd = cursor.fetchall()

        lista_final = []
        for u in usuarios_bd:
            lista_final.append({
                "id": u[0],
                "nombre": u[1],
                "email": u[2],
                "rol": u[3],
                "created_at": str(u[4]) if u[4] else None
            })

        return lista_final
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{tr(request, 'error_listar_usuarios')}: {str(e)}")
    finally:
        cursor.close()
        conn.close()
