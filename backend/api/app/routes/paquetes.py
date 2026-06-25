# backend/routes/paquetes.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from api.database import obtener_conexion

router = APIRouter(
    prefix="/api/paquetes",
    tags=["Paquetes"]
)

# ============================================================
# MODELOS
# ============================================================

class PaqueteCreate(BaseModel):
    nombre: str
    descripcion_base: str
    duracion_dias: int
    perfil_usuario: str
    precio_sugerido: float
    tours: List[int] = []

class PaqueteUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion_base: Optional[str] = None
    duracion_dias: Optional[int] = None
    perfil_usuario: Optional[str] = None
    precio_sugerido: Optional[float] = None
    tours: Optional[List[int]] = None
    estado: Optional[int] = None

# ============================================================
# ENDPOINTS
# ============================================================

# 1️⃣ LISTAR PAQUETES
@router.get("/")
async def obtener_paquetes():
    """Obtener todos los paquetes activos"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión a la Base de Datos")
    
    try:
        with conexion.cursor() as cursor:
            sql = """
                SELECT 
                    p.id, 
                    p.nombre, 
                    p.descripcion_base, 
                    p.duracion_dias, 
                    p.perfil_usuario, 
                    p.precio_sugerido,
                    p.estado,
                    p.created_at,
                    p.updated_at,
                    (
                        SELECT ti.imagen_url 
                        FROM paquete_tour pt
                        LEFT JOIN tour_imagenes ti ON pt.tour_id = ti.tour_id
                        WHERE pt.paquete_id = p.id
                        ORDER BY pt.orden_dia ASC, pt.id ASC
                        LIMIT 1
                    ) as imagen_base64
                FROM paquetes p
                ORDER BY p.id DESC
            """
            cursor.execute(sql)
            resultados = cursor.fetchall()
            
            paquetes = []
            for r in resultados:
                paquetes.append({
                    "id": int(r[0]),
                    "nombre": str(r[1]),
                    "descripcion_base": str(r[2]),
                    "duracion_dias": int(r[3]),
                    "perfil_usuario": str(r[4]),
                    "precio_sugerido": float(r[5]),
                    "estado": int(r[6]),
                    "created_at": r[7].strftime("%Y-%m-%d %H:%M:%S") if r[7] else None,
                    "updated_at": r[8].strftime("%Y-%m-%d %H:%M:%S") if r[8] else None,
                    "imagen_base64": r[9] if r[9] else None
                })
                
            return paquetes
            
    except Exception as e:
        print(f"❌ Error al obtener paquetes: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error en MySQL: {str(e)}")
    finally:
        conexion.close()


# 2️⃣ CREAR PAQUETE (POST) - ✅ AGREGADO
@router.post("/")
async def crear_paquete(paquete: PaqueteCreate):
    """Crear un nuevo paquete"""
    print("=" * 50)
    print("📥 Creando nuevo paquete")
    print(f"   Nombre: {paquete.nombre}")
    print(f"   Perfil: {paquete.perfil_usuario}")
    print(f"   Precio: {paquete.precio_sugerido}")
    print(f"   Tours: {paquete.tours}")
    print("=" * 50)
    
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    try:
        with conexion.cursor() as cursor:
            # Insertar paquete
            sql_paquete = """
                INSERT INTO paquetes (
                    nombre, descripcion_base, duracion_dias, 
                    perfil_usuario, precio_sugerido, estado,
                    created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            cursor.execute(sql_paquete, (
                paquete.nombre,
                paquete.descripcion_base,
                paquete.duracion_dias,
                paquete.perfil_usuario,
                paquete.precio_sugerido,
                1,  # estado activo
                now,
                now
            ))
            
            paquete_id = cursor.lastrowid
            
            # Insertar tours relacionados
            if paquete.tours:
                sql_tour = """
                    INSERT INTO paquete_tour (paquete_id, tour_id, orden_dia)
                    VALUES (%s, %s, %s)
                """
                for idx, tour_id in enumerate(paquete.tours):
                    cursor.execute(sql_tour, (paquete_id, tour_id, idx + 1))
            
            conexion.commit()
            
            print(f"✅ Paquete creado con ID: {paquete_id}")
            print("=" * 50)
            
            return {
                "status": "success",
                "message": "Paquete creado exitosamente",
                "paquete_id": paquete_id
            }
            
    except Exception as e:
        conexion.rollback()
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")
    finally:
        conexion.close()


# 3️⃣ OBTENER PAQUETE POR ID
@router.get("/{paquete_id}")
async def obtener_detalle_paquete(paquete_id: int):
    """Obtener detalle de un paquete específico"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión")
    
    try:
        with conexion.cursor() as cursor:
            # Información del paquete
            sql_paquete = """
                SELECT 
                    p.id, 
                    p.nombre, 
                    p.descripcion_base, 
                    p.duracion_dias, 
                    p.perfil_usuario, 
                    p.precio_sugerido,
                    p.estado,
                    p.created_at,
                    p.updated_at,
                    (
                        SELECT ti.imagen_url 
                        FROM paquete_tour pt
                        LEFT JOIN tour_imagenes ti ON pt.tour_id = ti.tour_id
                        WHERE pt.paquete_id = p.id
                        ORDER BY pt.orden_dia ASC, pt.id ASC
                        LIMIT 1
                    ) as imagen_base64
                FROM paquetes p
                WHERE p.id = %s
            """
            cursor.execute(sql_paquete, (paquete_id,))
            res_paquete = cursor.fetchone()
            
            if not res_paquete:
                raise HTTPException(status_code=404, detail="Paquete no encontrado")
            
            # Tours vinculados
            sql_tours = """
                SELECT t.id, t.nombre, t.zona_geografica, t.descripcion, pt.orden_dia
                FROM paquete_tour pt
                INNER JOIN tours t ON pt.tour_id = t.id
                WHERE pt.paquete_id = %s
                ORDER BY pt.orden_dia ASC, pt.id ASC
            """
            cursor.execute(sql_tours, (paquete_id,))
            res_tours = cursor.fetchall()
            
            tours_vinculados = []
            for t in res_tours:
                tours_vinculados.append({
                    "id": int(t[0]),
                    "nombre": str(t[1]),
                    "zona_geografica": str(t[2]),
                    "descripcion": str(t[3]),
                    "orden_dia": int(t[4])
                })
            
            return {
                "id": int(res_paquete[0]),
                "nombre": str(res_paquete[1]),
                "descripcion_base": str(res_paquete[2]),
                "duracion_dias": int(res_paquete[3]),
                "perfil_usuario": str(res_paquete[4]),
                "precio_sugerido": float(res_paquete[5]),
                "estado": int(res_paquete[6]),
                "created_at": res_paquete[7].strftime("%Y-%m-%d %H:%M:%S") if res_paquete[7] else None,
                "updated_at": res_paquete[8].strftime("%Y-%m-%d %H:%M:%S") if res_paquete[8] else None,
                "imagen_base64": res_paquete[9] if res_paquete[9] else None,
                "tours": tours_vinculados
            }
            
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conexion.close()


# 4️⃣ ACTUALIZAR PAQUETE (PUT)
@router.put("/{paquete_id}")
async def actualizar_paquete(paquete_id: int, paquete: PaqueteUpdate):
    """Actualizar un paquete existente"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión")
    
    try:
        with conexion.cursor() as cursor:
            # Verificar que existe
            cursor.execute("SELECT id FROM paquetes WHERE id = %s", (paquete_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Paquete no encontrado")
            
            updates = []
            params = []
            
            if paquete.nombre is not None:
                updates.append("nombre = %s")
                params.append(paquete.nombre)
            
            if paquete.descripcion_base is not None:
                updates.append("descripcion_base = %s")
                params.append(paquete.descripcion_base)
            
            if paquete.duracion_dias is not None:
                updates.append("duracion_dias = %s")
                params.append(paquete.duracion_dias)
            
            if paquete.perfil_usuario is not None:
                updates.append("perfil_usuario = %s")
                params.append(paquete.perfil_usuario)
            
            if paquete.precio_sugerido is not None:
                updates.append("precio_sugerido = %s")
                params.append(paquete.precio_sugerido)
            
            if paquete.estado is not None:
                updates.append("estado = %s")
                params.append(paquete.estado)
            
            if updates:
                updates.append("updated_at = %s")
                params.append(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
                params.append(paquete_id)
                
                sql = f"UPDATE paquetes SET {', '.join(updates)} WHERE id = %s"
                cursor.execute(sql, params)
            
            # Actualizar tours
            if paquete.tours is not None:
                # Eliminar tours antiguos
                cursor.execute("DELETE FROM paquete_tour WHERE paquete_id = %s", (paquete_id,))
                
                # Insertar nuevos tours
                sql_tour = "INSERT INTO paquete_tour (paquete_id, tour_id, orden_dia) VALUES (%s, %s, %s)"
                for idx, tour_id in enumerate(paquete.tours):
                    cursor.execute(sql_tour, (paquete_id, tour_id, idx + 1))
            
            conexion.commit()
            
            return {
                "status": "success",
                "message": "Paquete actualizado exitosamente"
            }
            
    except Exception as e:
        conexion.rollback()
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conexion.close()


# 5️⃣ ELIMINAR PAQUETE (DELETE)
@router.delete("/{paquete_id}")
async def eliminar_paquete(paquete_id: int):
    """Eliminar (desactivar) un paquete"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión")
    
    try:
        with conexion.cursor() as cursor:
            cursor.execute("""
                UPDATE paquetes 
                SET estado = 0, updated_at = %s
                WHERE id = %s
            """, (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), paquete_id))
            
            conexion.commit()
            
            return {
                "status": "success",
                "message": "Paquete eliminado (desactivado) exitosamente"
            }
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conexion.close()