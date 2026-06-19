# filepath: .../routes/usuarios.py
import bcrypt
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from api.database import obtener_conexion

# Usamos bcrypt directamente en lugar de passlib.context para evitar errores de importación
router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])

# === MODELOS DE PETICIÓN (PYDANTIC) ===
class CrearUsuarioRequest(BaseModel):
    nombre: str
    email: str
    password: str
    rol: str = "admin"  # Por defecto admin o empleado

class ActualizarPerfilRequest(BaseModel):
    id_usuario: int
    nombre: str
    email: str

class CambiarPasswordRequest(BaseModel):
    id_usuario: int
    password_actual: str
    password_nueva: str

# NUEVO: Modelo para editar un usuario completo desde la tabla de administración
class EditarUsuarioRequest(BaseModel):
    id_usuario: int
    nombre: str
    email: str
    rol: str
    password: Optional[str] = None  # Opcional por si no se desea cambiar la contraseña

# ==========================================
# 1. ENDPOINT: AGREGAR NUEVAS PERSONAS (ADMIN)
# ==========================================
@router.post("/crear")
async def crear_usuario(data: CrearUsuarioRequest):
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        # Encriptamos la contraseña antes de guardarla en PostgreSQL usando bcrypt
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
        
        return {"message": "Usuario registrado con éxito", "id_usuario": nuevo_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"El correo ya existe o hubo un error: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# ==========================================
# 2. ENDPOINT: CORREGIR NOMBRE O EMAIL (PROPIO PERFIL)
# ==========================================
@router.put("/actualizar-perfil")
async def actualizar_perfil(data: ActualizarPerfilRequest):
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
        return {"message": "Perfil actualizado correctamente."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Error al actualizar: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# ==========================================
# 3. ENDPOINT: CAMBIAR CONTRASEÑA (CON ADAPTACIÓN DE HASH PHP)
# ==========================================
@router.put("/cambiar-password")
async def cambiar_password(data: CambiarPasswordRequest):
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        print(f"--- INTENTO DE CAMBIO DE CLAVE ---")
        print(f"Buscando ID de usuario: {data.id_usuario}")
        print(f"Clave escrita en el formulario: {data.password_actual}")

        cursor.execute("SELECT password, email FROM usuarios WHERE id = %s;", (data.id_usuario,))
        usuario = cursor.fetchone()
        
        if not usuario:
            print("❌ ERROR: El ID de usuario no existe en la BD.")
            raise HTTPException(status_code=400, detail="Usuario no encontrado.")
            
        password_bd = usuario[0]
        email_bd = usuario[1]
        print(f"Usuario encontrado: {email_bd}")
        print(f"Clave que está guardada en la BD actualmente: {password_bd}")
        
        # --- COMPATIBILIDAD PHP/LARAVEL ($2y$ -> $2b$) ---
        if password_bd.startswith("$2y$"):
            password_bd = password_bd.replace("$2y$", "$2b$", 1)
            print("→ Hash de origen PHP detectado. Adaptado a formato Python ($2b$) temporalmente.")
        
        valida = False
        try:
            valida = bcrypt.checkpw(data.password_actual.encode('utf-8'), password_bd.encode('utf-8'))
        except Exception as e:
            # Si no es un hash, comparamos texto plano directo
            print(f"Aviso: La clave en la BD no es un hash Bcrypt válido. Evaluando texto plano...")
            valida = (data.password_actual == password_bd)
            
        print(f"¿La contraseña ingresada coincide con la BD?: {valida}")
            
        if not valida:
            raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta.")
            
        # Generar hash nuevo limpio bajo estándar nativo ($2b$)
        salt = bcrypt.gensalt()
        nueva_encriptada = bcrypt.hashpw(data.password_nueva.encode('utf-8'), salt).decode('utf-8')
        
        cursor.execute(
            "UPDATE usuarios SET password = %s, updated_at = NOW() WHERE id = %s;",
            (nueva_encriptada, data.id_usuario)
        )
        conn.commit()
        print("✅ ÉXITO: Contraseña cambiada y encriptada correctamente.")
        return {"message": "Contraseña modificada exitosamente."}
    except Exception as e:
        conn.rollback()
        print(f"❌ ERROR GENERAL: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# ==========================================
# 4. NUEVO ENDPOINT: EDITAR USUARIO COMPLETO (DESDE LA TABLA)
# ==========================================
@router.put("/editar")
async def editar_usuario(data: EditarUsuarioRequest):
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        # Si el administrador ingresó una contraseña nueva en el formulario, la encriptamos
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
            # Si se dejó la contraseña vacía, mantenemos la contraseña actual y cambiamos solo los datos básicos
            cursor.execute(
                """
                UPDATE usuarios 
                SET nombre = %s, email = %s, rol = %s, updated_at = NOW()
                WHERE id = %s;
                """,
                (data.nombre, data.email, data.rol, data.id_usuario)
            )
            
        conn.commit()
        return {"message": "Usuario modificado correctamente."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Error al editar usuario: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# ==========================================
# 5. NUEVO ENDPOINT: ELIMINAR USUARIO (DESDE LA TABLA)
# ==========================================
@router.delete("/eliminar/{id_usuario}")
async def eliminar_usuario(id_usuario: int):
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM usuarios WHERE id = %s;", (id_usuario,))
        conn.commit()
        return {"message": "Usuario eliminado correctamente."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Error al eliminar usuario: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# ==========================================
# 6. NUEVO ENDPOINT: LISTAR TODOS LOS USUARIOS (TABLA)
# ==========================================
@router.get("")  # Al dejarlo vacío se monta directamente sobre el prefijo "/api/usuarios"
async def listar_usuarios():
    conn = obtener_conexion()
    cursor = conn.cursor()
    try:
        # Traemos solo los datos necesarios (NUNCA el campo password por seguridad)
        cursor.execute(
            """
            SELECT id, nombre, email, rol, created_at 
            FROM usuarios 
            ORDER BY id ASC;
            """
        )
        usuarios_bd = cursor.fetchall()
        
        # Mapeamos las tuplas devueltas por PostgreSQL a un formato JSON compatible con JS
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
        raise HTTPException(status_code=500, detail=f"Error en el servidor al listar: {str(e)}")
    finally:
        cursor.close()
        conn.close()