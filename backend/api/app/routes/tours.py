import base64
import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from api.database import obtener_conexion

router = APIRouter(
    prefix="/api",
    tags=["Visión e Imágenes"]
)

# ==========================================
# 1. ENDPOINT PARA REGISTRAR UN NUEVO TOUR (POST)
# Guarda la imagen directamente en la BD como Base64
# ==========================================
@router.post("/tours")
async def registrar_tour(
    nombre: str = Form(...),
    zona_geografica: str = Form(...),
    descripcion: str = Form(...),
    itinerario: str = Form(...),
    inclusiones: str = Form(...),
    estado: int = Form(1),
    imagen: UploadFile = File(...)
):
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión a la Base de Datos")
    
    try:
        # 1. Convertir la imagen binaria cargada en un String Base64 estándar
        contenido_bytes = await imagen.read()
        base64_encoded = base64.b64encode(contenido_bytes).decode('utf-8')
        
        # 2. Construir el prefijo Data URI dinámico (ej: data:image/png;base64,...)
        tipo_contenido = imagen.content_type or "image/jpeg"
        string_imagen_base64 = f"data:{tipo_contenido};base64,{base64_encoded}"
        
        with conexion.cursor() as cursor:
            # 3. Insertar los datos del tour en la tabla 'tours'
            sql_tour = """
                INSERT INTO tours (nombre, zona_geografica, descripcion, itinerario, inclusiones, estado)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql_tour, (nombre, zona_geografica, descripcion, itinerario, inclusiones, estado))
            tour_id = cursor.lastrowid
            
            # 4. Guardar el String de la imagen vinculada en 'tour_imagenes'
            sql_imagen = """
                INSERT INTO tour_imagenes (tour_id, imagen_url)
                VALUES (%s, %s)
            """
            cursor.execute(sql_imagen, (tour_id, string_imagen_base64))
            
        conexion.commit()
        return {"status": "success", "message": "Tour e imagen indexados en la BD de forma binaria-base64", "tour_id": tour_id}
            
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=400, detail=f"Error al registrar en MySQL: {str(e)}")
    finally:
        conexion.close()


# ==========================================
# 2. ENDPOINT PARA LISTAR LOS TOURS (GET)
# Devuelve la información del tour + la imagen codificada
# ==========================================
@router.get("/tours")
async def listar_tours():
    conexion = obtener_conexion()
    try:
        with conexion.cursor(dictionary=True) as cursor:
            # Ahora seleccionamos también itinerario e inclusiones
            sql = """
                SELECT t.id, t.nombre, t.zona_geografica, t.descripcion, 
                       t.itinerario, t.inclusiones, t.estado, ti.imagen_url
                FROM tours t
                LEFT JOIN tour_imagenes ti ON t.id = ti.tour_id
                WHERE t.estado = 1
                ORDER BY t.id DESC
            """
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        conexion.close()

@router.get("/tours/{id}")
async def obtener_tour(id: int):
    conexion = obtener_conexion()
    try:
        with conexion.cursor(dictionary=True) as cursor:
            sql = """
                SELECT t.id, t.nombre, t.zona_geografica, t.descripcion, 
                       t.itinerario, t.inclusiones, ti.imagen_url
                FROM tours t
                LEFT JOIN tour_imagenes ti ON t.id = ti.tour_id
                WHERE t.id = %s
            """
            cursor.execute(sql, (id,))
            resultado = cursor.fetchone()
            if not resultado:
                raise HTTPException(status_code=404, detail="Tour no encontrado")
            return resultado
    finally:
        conexion.close()