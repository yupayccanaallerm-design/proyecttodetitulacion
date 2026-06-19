from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from api.database import obtener_conexion

router = APIRouter(
    prefix="/api",
    tags=["Paquetes y Tours"]
)

class PaqueteInsertar(BaseModel):
    nombre: str
    descripcion_base: str
    duracion_dias: int
    perfil_usuario: str
    precio_sugerido: float
    tours: List[int]

@router.post("/paquetes")
async def guardar_paquete(paquete: PaqueteInsertar):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión a Hostinger")
    
    try:
        with conexion.cursor() as cursor:
            # Insertar en 'paquetes' incluyendo la columna 'estado' con valor 1 (Activo)
            sql_paquete = """
                INSERT INTO paquetes (nombre, descripcion_base, duracion_dias, perfil_usuario, precio_sugerido, estado)
                VALUES (%s, %s, %s, %s, %s, 1)
            """
            cursor.execute(sql_paquete, (
                paquete.nombre, 
                paquete.descripcion_base, 
                paquete.duracion_dias, 
                paquete.perfil_usuario, 
                paquete.precio_sugerido
            ))
            
            paquete_id = cursor.lastrowid

            # Insertar en 'paquete_tour' usando la columna 'orden_dia' por defecto en 1
            sql_intermedia = "INSERT INTO paquete_tour (paquete_id, tour_id, orden_dia) VALUES (%s, %s, 1)"
            for tour_id in paquete.tours:
                cursor.execute(sql_intermedia, (paquete_id, tour_id))
            
            conexion.commit()
            return {"status": "success", "message": "Paquete registrado con éxito", "paquete_id": paquete_id}
            
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=400, detail=f"Error en MySQL: {str(e)}")
    finally:
        conexion.close()